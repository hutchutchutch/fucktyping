import { DurableObject } from "cloudflare:workers";

import type { Env } from "../env";
import { FormRepository } from "../forms/repository";
import type { ConversationState, FormConfig } from "../forms/types";
import { FormInterpreter } from "./interpreter";
import { parseClientMessage, type ServerMessage } from "./protocol";
import { Validator } from "./validator";

interface PersistedSession {
  config: FormConfig;
  state: ConversationState;
  callbackUrl?: string;
  meta?: unknown;
}

/** One instance per voice-form response session. Holds conversation state, runs the
 *  interpreter, validates via AI Gateway, and persists collected output to D1.
 *  Uses the WebSocket Hibernation API so idle sessions don't bill compute. */
export class FormSessionDO extends DurableObject<Env> {
  private session?: PersistedSession;
  private urlFormId?: string;

  override async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    // The worker forwards the original request, so the path carries the formId — use it
    // as the authoritative source even if the client's start message omits form_id.
    const m = new URL(req.url).pathname.match(/\/forms\/([^/]+)\/session/);
    if (m) this.urlFormId = decodeURIComponent(m[1]);
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
      console.error("FormSessionDO error", err);
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
    const { config, callbackUrl, meta } = await new FormRepository(this.env).getForm(
      formId ?? this.urlFormId ?? "sample",
    );
    const { state, reply } = this.interpreterFor(config).begin();
    this.session = { config, state, callbackUrl, meta };
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
    const { state, reply } = await this.interpreterFor(this.session.config).handleAnswer(
      this.session.state,
      userText,
    );
    this.session.state = state;
    await this.ctx.storage.put("session", this.session);
    if (reply.done) {
      await new FormRepository(this.env).saveResponse(this.session.config.id, state.responses);
      if (this.session.callbackUrl) {
        this.ctx.waitUntil(
          this.fireCallback(this.session.callbackUrl, this.session.config, state.responses, this.session.meta),
        );
      }
    }
    this.send(ws, reply);
  }

  /** POST the collected structured output to the form's callback (e.g. a Hermes webhook
   *  that delivers it to Discord). The callback URL carries its own auth. */
  private async fireCallback(
    url: string,
    config: FormConfig,
    responses: Record<string, unknown>,
    meta: unknown,
  ): Promise<void> {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          formId: config.id,
          formName: config.name,
          responses,
          meta,
          completedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("fireCallback failed", err);
    }
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    ws.send(JSON.stringify(msg));
  }
}
