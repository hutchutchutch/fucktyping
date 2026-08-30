import { DurableObject } from "cloudflare:workers";

import type { Env } from "../env";
import { LLMAuthoringBrain, type AuthoringBrain } from "../authoring/agent";
import { emptyDraft, isPublishable, toPublished, type ChatMessage, type DraftFormConfig } from "../authoring/draft";
import {
  parseAuthoringClientMessage,
  type AuthoringServerMessage,
} from "../authoring/protocol";
import { applyMutations } from "../authoring/reducer";
import { FormRepository } from "../forms/repository";

interface AuthoringState {
  form: DraftFormConfig;
  messages: ChatMessage[];
}

const GREETING =
  "Hi! I'll help you build a voice form. What do you want to collect, and from whom?";

/** One instance per authoring session. Runs the tool-calling brain on each creator
 *  message, applies the resulting mutations to a draft FormConfig, and broadcasts the
 *  full state to every connected socket — that broadcast is the live graph pane. */
export class FormAuthoringDO extends DurableObject<Env> {
  private state?: AuthoringState;
  private brain: AuthoringBrain;
  private ownerId?: string;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.brain = new LLMAuthoringBrain(env);
  }

  override async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    this.ownerId = req.headers.get("X-FuckTyping-Owner") ?? undefined;
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const text = typeof raw === "string" ? raw : new TextDecoder().decode(raw);
    const msg = parseAuthoringClientMessage(text);
    if (!msg) return this.send(ws, { type: "error", message: "unrecognized message" });
    try {
      if (msg.type === "init") return await this.onInit(ws);
      if (msg.type === "user_message") return await this.onUserMessage(ws, msg.text);
      if (msg.type === "publish") return await this.onPublish(ws);
    } catch (err) {
      console.error("FormAuthoringDO error", err);
      this.send(ws, { type: "error", message: "the assistant hit an error; please try again" });
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    try {
      ws.close();
    } catch {
      /* already closed */
    }
  }

  private async load(): Promise<AuthoringState> {
    if (this.state) return this.state;
    const stored = await this.ctx.storage.get<AuthoringState>("authoring");
    this.state = stored ?? {
      form: emptyDraft(crypto.randomUUID()),
      messages: [{ role: "assistant", content: GREETING }],
    };
    return this.state;
  }

  private async persist(): Promise<void> {
    if (this.state) await this.ctx.storage.put("authoring", this.state);
  }

  private async onInit(ws: WebSocket): Promise<void> {
    await this.load();
    this.send(ws, this.snapshot());
  }

  private async onUserMessage(ws: WebSocket, text: string): Promise<void> {
    const state = await this.load();
    state.messages.push({ role: "user", content: text });
    this.broadcast({ type: "thinking" });

    const turn = await this.brain.respond(state.messages, state.form);
    state.form = applyMutations(state.form, turn.mutations);
    state.messages.push({ role: "assistant", content: turn.text });

    await this.persist();
    this.broadcast(this.snapshot()); // updates both the chat and the graph pane
  }

  private async onPublish(ws: WebSocket): Promise<void> {
    const state = await this.load();
    if (!isPublishable(state.form)) {
      return this.send(ws, {
        type: "error",
        message: "Form isn't ready: needs a name, opening, closing, and at least one question.",
      });
    }
    const published = toPublished(state.form);
    if (!this.ownerId) return this.send(ws, { type: "error", message: "authoring session is unauthorized" });
    await new FormRepository(this.env).saveForm(published, { ownerId: this.ownerId });
    this.broadcast({ type: "published", formId: published.id });
  }

  private snapshot(): AuthoringServerMessage {
    const state = this.state!;
    return {
      type: "snapshot",
      form: state.form,
      messages: state.messages,
      ready: isPublishable(state.form),
    };
  }

  private send(ws: WebSocket, msg: AuthoringServerMessage): void {
    ws.send(JSON.stringify(msg));
  }

  private broadcast(msg: AuthoringServerMessage): void {
    const payload = JSON.stringify(msg);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        /* socket closing */
      }
    }
  }
}
