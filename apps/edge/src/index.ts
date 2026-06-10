import { Hono } from "hono";
import { cors } from "hono/cors";

import { verifySessionToken } from "./auth";
import type { Env } from "./env";
import { FormRepository } from "./forms/repository";

// Durable Object classes must be exported from the Worker entrypoint.
export { FormSessionDO } from "./do/FormSessionDO";
export { FormAuthoringDO } from "./do/FormAuthoringDO";

const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) => c.text("ok"));

// Cross-origin requests from the studio dev server need CORS (WS upgrades don't).
// TODO: restrict origin before exposing publicly.
app.use("/transcribe", cors());
app.use("/forms", cors());

/**
 * Speech-to-text for form-creation push-to-talk. The studio records a short clip,
 * sends WAV bytes here, and we transcribe with Workers AI Whisper.
 *
 *   POST /transcribe   (body: audio/wav bytes)  ->  { text }
 */
app.post("/transcribe", async (c) => {
  const buf = await c.req.arrayBuffer();
  if (buf.byteLength === 0) return c.json({ error: "no audio" }, 400);
  const result = (await c.env.AI.run("@cf/openai/whisper", {
    audio: [...new Uint8Array(buf)],
  })) as { text?: string };
  return c.json({ text: result.text ?? "" });
});

/** Published-forms list for the studio's "My forms" sidebar. */
app.get("/forms", async (c) => {
  const forms = await new FormRepository(c.env).listForms();
  return c.json(forms);
});

/**
 * Authorize a WS session against the path subject. Auth is OPTIONAL: when
 * SESSION_SECRET is unset (local dev) it's skipped; when set, a valid `?token=`
 * whose `sub` matches the path id is required. (Browsers can't set headers on
 * `new WebSocket`, so the token rides the query string.)
 */
async function authorized(c: { env: Env; req: { query: (k: string) => string | undefined } }, sub: string): Promise<boolean> {
  const secret = c.env.SESSION_SECRET;
  if (!secret) return true; // auth disabled until a secret is configured
  const claims = await verifySessionToken(secret, c.req.query("token") ?? "");
  return !!claims && claims.sub === sub;
}

/**
 * WebSocket entry for a voice-form response session. The Mac voice pipeline
 * (do_client.py) connects here and drives the conversation.
 *
 *   GET /forms/:formId/session?session=<id>&token=<jwt>   (Upgrade: websocket)
 */
app.get("/forms/:formId/session", async (c) => {
  if (c.req.header("Upgrade") !== "websocket") {
    return c.text("expected websocket", 426);
  }
  const formId = c.req.param("formId");
  if (!(await authorized(c, formId))) return c.text("unauthorized", 401);
  const sessionId = c.req.query("session") ?? crypto.randomUUID();
  const id = c.env.FORM_SESSION.idFromName(`${formId}:${sessionId}`);
  return c.env.FORM_SESSION.get(id).fetch(c.req.raw);
});

/**
 * WebSocket entry for a form-authoring session. The creator's browser connects here;
 * the DO broadcasts full state (chat + draft form) for the chat and live graph panes.
 *
 *   GET /authoring/:sessionId/session?token=<jwt>   (Upgrade: websocket)
 */
app.get("/authoring/:sessionId/session", async (c) => {
  if (c.req.header("Upgrade") !== "websocket") {
    return c.text("expected websocket", 426);
  }
  const sessionId = c.req.param("sessionId");
  if (!(await authorized(c, sessionId))) return c.text("unauthorized", 401);
  const id = c.env.FORM_AUTHORING.idFromName(sessionId);
  return c.env.FORM_AUTHORING.get(id).fetch(c.req.raw);
});

export default app;
