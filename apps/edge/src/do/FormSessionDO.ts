import { DurableObject } from "cloudflare:workers";

import { buildCallbackPayload } from "../callbacks";
import type { Env } from "../env";
import { FormRepository } from "../forms/repository";
import type { ConversationState, FormConfig } from "../forms/types";
import { FormInterpreter } from "./interpreter";
import { parseClientMessage, type ServerMessage } from "./protocol";
import { Validator } from "./validator";

interface PersistedSession {
  config: FormConfig;
  ownerId: string;
  sessionId: string;
  state: ConversationState;
  callbackUrl?: string;
  meta?: unknown;
}

/** One instance per voice-form response session. Holds conversation state, runs the
 *  interpreter, validates through Workers AI when needed, and persists output to D1.
 *  Uses the WebSocket Hibernation API so idle sessions don't bill compute. */
export class FormSessionDO extends DurableObject<Env> {
  private session?: PersistedSession;
  private urlFormId?: string;
  private urlSessionId?: string;

  override async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    // The worker forwards the original request, so the path carries the formId — use it
    // as the authoritative source even if the client's start message omits form_id.
    const url = new URL(req.url);
    const m = url.pathname.match(/\/forms\/([^/]+)\/session/);
    if (m) this.urlFormId = decodeURIComponent(m[1]);
    this.urlSessionId = url.searchParams.get("session") ?? undefined;
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server); // hibernatable
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const text = typeof raw === "string" ? raw : new TextDecoder().decode(raw);
    const msg = parseClientMessage(text);
    if (!msg) {
      return this.send(ws, { type: "assistant", text: "Sorry, I didn't understand that.", done: false });
    }
    try {
      if (msg.type === "start") return await this.onStart(ws, msg.form_id);
      return await this.onAnswer(ws, msg.text);
    } catch (err) {
      console.error(JSON.stringify({
        event: "response_session_error",
        formId: this.urlFormId ?? null,
        sessionId: this.urlSessionId ?? null,
        error: err instanceof Error ? err.message : "unknown error",
      }));
      this.send(ws, { type: "assistant", text: "Something went wrong — let's try that again.", done: false });
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    try {
      ws.close();
    } catch {
      /* already closed */
    }
  }

  private interpreterFor(config: FormConfig): FormInterpreter {
    return new FormInterpreter(config, new Validator(this.env));
  }

  private async onStart(ws: WebSocket, formId?: string): Promise<void> {
    const { config, ownerId, callbackUrl, meta } = await new FormRepository(this.env).getForm(
      formId ?? this.urlFormId ?? "sample",
    );
    const { state, reply } = this.interpreterFor(config).begin();
    this.session = {
      config,
      ownerId,
      sessionId: this.urlSessionId ?? crypto.randomUUID(),
      state,
      callbackUrl,
      meta,
    };
    await this.ctx.storage.put("session", this.session);
    this.send(ws, reply);
  }

  private async onAnswer(ws: WebSocket, userText: string): Promise<void> {
    if (!this.session) {
      this.session = await this.ctx.storage.get<PersistedSession>("session");
    }
    if (!this.session) {
      return this.send(ws, { type: "assistant", text: "Let's start over — say start to begin.", done: false });
    }
    // Sessions persisted before migration 0003 did not carry these fields.
    if (!this.session.ownerId || !this.session.sessionId) {
      const form = await new FormRepository(this.env).getForm(this.session.config.id);
      this.session.ownerId = form.ownerId;
      this.session.sessionId = this.urlSessionId ?? crypto.randomUUID();
    }
    const { state, reply } = await this.interpreterFor(this.session.config).handleAnswer(
      this.session.state,
      userText,
    );
    this.session.state = state;
    await this.ctx.storage.put("session", this.session);
    if (reply.done) {
      const repository = new FormRepository(this.env);
      const callback = this.session.callbackUrl ? {
        url: this.session.callbackUrl,
        payload: buildCallbackPayload(this.session.config, state.responses, this.session.meta),
      } : undefined;
      const completion = await repository.saveResponse(
        this.session.config.id,
        this.session.ownerId,
        this.session.sessionId,
        state.responses,
        callback,
      );
      if (completion.deliveryId) {
        try {
          await this.env.CALLBACK_QUEUE.send({ deliveryId: completion.deliveryId });
          await repository.markCallbackQueued(completion.deliveryId);
        } catch (cause) {
          // The D1 outbox remains pending and the scheduled sweep will enqueue it.
          console.error(JSON.stringify({
            event: "callback_enqueue_failed",
            deliveryId: completion.deliveryId,
            error: cause instanceof Error ? cause.message : "queue send failed",
          }));
        }
      }
    }
    this.send(ws, reply);
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    ws.send(JSON.stringify(msg));
  }
}
