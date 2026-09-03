import { DurableObject } from "cloudflare:workers";

import { buildCallbackPayload } from "../callbacks";
import type { Env } from "../env";
import { FormRepository } from "../forms/repository";
import type { ConversationState, FormConfig } from "../forms/types";
import {
  parseResponseConnection,
  type ResponseConnection,
  TRUSTED_EXPIRY_HEADER,
  TRUSTED_FORM_HEADER,
  TRUSTED_SESSION_HEADER,
} from "../session-context";
import { FormInterpreter } from "./interpreter";
import { parseClientMessage, type ServerMessage } from "./protocol";
import { SerialTaskQueue } from "./serial";
import { Validator } from "./validator";
import { webSocketResponseHeaders } from "../websocket-auth";

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
  private readonly operations = new SerialTaskQueue();

  override async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    const connection = parseResponseConnection({
      kind: "response",
      formId: req.headers.get(TRUSTED_FORM_HEADER),
      sessionId: req.headers.get(TRUSTED_SESSION_HEADER),
      expiresAt: Number(req.headers.get(TRUSTED_EXPIRY_HEADER)),
    });
    if (!connection) return new Response("missing trusted session context", { status: 400 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server); // hibernatable
    server.serializeAttachment(connection);
    return new Response(null, { status: 101, webSocket: client, headers: webSocketResponseHeaders(req) });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    return this.operations.run(() => this.handleWebSocketMessage(ws, raw));
  }

  private async handleWebSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const trusted = this.connection(ws);
    if (!trusted || trusted.expiresAt <= Math.floor(Date.now() / 1000)) {
      ws.close(1008, "session expired");
      return;
    }
    const text = typeof raw === "string" ? raw : new TextDecoder().decode(raw);
    const msg = parseClientMessage(text);
    if (!msg) {
      return this.send(ws, { type: "assistant", text: "Sorry, I didn't understand that.", done: false });
    }
    try {
      if (msg.type === "start") return await this.onStart(ws);
      return await this.onAnswer(ws, msg.text);
    } catch (err) {
      const connection = this.connection(ws);
      console.error(JSON.stringify({
        event: "response_session_error",
        formId: connection?.formId ?? null,
        sessionId: connection?.sessionId ?? null,
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

  private connection(ws: WebSocket): ResponseConnection | null {
    return parseResponseConnection(ws.deserializeAttachment());
  }

  private async onStart(ws: WebSocket): Promise<void> {
    const connection = this.connection(ws);
    if (!connection) throw new Error("trusted response context unavailable");
    if (!this.session) this.session = await this.ctx.storage.get<PersistedSession>("session");
    if (this.session) {
      if (this.session.config.id !== connection.formId || this.session.sessionId !== connection.sessionId) {
        throw new Error("persisted response context mismatch");
      }
      return this.send(ws, this.interpreterFor(this.session.config).resume(this.session.state));
    }
    const { config, ownerId, callbackUrl, meta } = await new FormRepository(this.env).getForm(connection.formId);
    const { state, reply } = this.interpreterFor(config).begin();
    this.session = {
      config,
      ownerId,
      sessionId: connection.sessionId,
      state,
      callbackUrl,
      meta,
    };
    await this.ctx.storage.put("session", this.session);
    this.send(ws, reply);
    console.log(JSON.stringify({
      event: "response_session_started",
      formId: config.id,
      sessionId: connection.sessionId,
    }));
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
      const connection = this.connection(ws);
      if (!connection) throw new Error("trusted response context unavailable");
      const form = await new FormRepository(this.env).getForm(this.session.config.id);
      this.session.ownerId = form.ownerId;
      this.session.sessionId = connection.sessionId;
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
      console.log(JSON.stringify({
        event: "response_session_completed",
        formId: this.session.config.id,
        sessionId: this.session.sessionId,
        inserted: completion.inserted,
        answerCount: Object.keys(state.responses).length,
      }));
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
