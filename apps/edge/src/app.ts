import { Hono } from "hono";
import { cors } from "hono/cors";

import { signSessionToken, verifySecret, verifySessionToken } from "./auth";
import type { SessionClaims } from "./auth";
import type { Env } from "./env";
import { formConfigFromCreateBody } from "./forms/create-request";
import { FormRepository } from "./forms/repository";

const app = new Hono<{ Bindings: Env }>();
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const SESSION_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

const devCors = cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  allowHeaders: ["Authorization", "Content-Type"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  maxAge: 86400,
});

app.use("/auth/*", devCors);
app.use("/transcribe", devCors);
app.use("/forms", devCors);

app.get("/health", (c) => c.text("ok"));

function clientKey(c: { req: { header: (name: string) => string | undefined } }, prefix: string): string {
  return `${prefix}:${c.req.header("CF-Connecting-IP") ?? "local"}`;
}

async function isRateLimited(binding: RateLimit, key: string): Promise<boolean> {
  const result = await binding.limit({ key });
  return !result.success;
}

function bearerToken(c: { req: { header: (name: string) => string | undefined } }): string {
  const header = c.req.header("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

async function bearerClaims(c: { env: Env; req: { header: (name: string) => string | undefined } }): Promise<SessionClaims | null> {
  if (!c.env.SESSION_SECRET) return null;
  return verifySessionToken(c.env.SESSION_SECRET, bearerToken(c));
}

/** Exchange the private-beta access key for a short-lived, session-scoped creator token. */
app.post("/auth/creator", async (c) => {
  c.header("Cache-Control", "no-store");
  if (!c.env.CREATE_TOKEN || !c.env.SESSION_SECRET) {
    console.error(JSON.stringify({ event: "auth_misconfigured", env: c.env.APP_ENV }));
    return c.json({ error: "authentication unavailable" }, 503);
  }
  if (await isRateLimited(c.env.AUTH_RATE_LIMITER, clientKey(c, "creator"))) {
    return c.json({ error: "too many attempts" }, 429);
  }

  const body = await c.req.json<{ accessToken?: unknown; sessionId?: unknown }>().catch(() => null);
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  if (!SESSION_ID_RE.test(sessionId)) return c.json({ error: "invalid session" }, 400);
  if (!(await verifySecret(c.env.CREATE_TOKEN, accessToken))) {
    return c.json({ error: "invalid access key" }, 401);
  }

  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const token = await signSessionToken(c.env.SESSION_SECRET, { sub: sessionId, exp, scope: "authoring" });
  return c.json({ token, expiresAt: new Date(exp * 1000).toISOString() });
});

/**
 * Speech-to-text for form-creation push-to-talk. The studio records a short clip,
 * sends WAV bytes here, and we transcribe with Workers AI Whisper.
 *
 *   POST /transcribe   (body: audio/wav bytes)  ->  { text }
 */
app.post("/transcribe", async (c) => {
  const claims = await bearerClaims(c);
  if (!claims) return c.json({ error: "unauthorized" }, 401);
  if (await isRateLimited(c.env.PUBLIC_RATE_LIMITER, clientKey(c, `transcribe:${claims.scope}`))) {
    return c.json({ error: "rate limit exceeded" }, 429);
  }
  const contentLength = Number(c.req.header("content-length") ?? 0);
  if (contentLength > MAX_AUDIO_BYTES) return c.json({ error: "audio too large" }, 413);
  const contentType = c.req.header("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("audio/")) return c.json({ error: "expected audio" }, 415);
  const buf = await c.req.arrayBuffer();
  if (buf.byteLength === 0) return c.json({ error: "no audio" }, 400);
  if (buf.byteLength > MAX_AUDIO_BYTES) return c.json({ error: "audio too large" }, 413);
  const result = (await c.env.AI.run("@cf/openai/whisper", {
    audio: [...new Uint8Array(buf)],
  })) as { text?: string };
  return c.json({ text: result.text ?? "" });
});

/** Published-forms list for the studio's "My forms" sidebar. */
app.get("/forms", async (c) => {
  const claims = await bearerClaims(c);
  if (claims?.scope !== "authoring") return c.json({ error: "unauthorized" }, 401);
  const forms = await new FormRepository(c.env).listForms();
  return c.json(forms);
});

/**
 * Programmatic form creation (called by Hermes voice-ask). Accepts either an explicit
 * FormConfig or a free-text brief, records a completion callback + meta, and returns a
 * responder URL with a runtime token baked in. Auth: Bearer CREATE_TOKEN.
 *
 *   POST /forms  { config?, brief?, callbackUrl?, meta?, ttlDays? }  ->  { formId, responderUrl }
 */
app.post("/forms", async (c) => {
  c.header("Cache-Control", "no-store");
  if (!c.env.CREATE_TOKEN || !c.env.SESSION_SECRET) {
    console.error(JSON.stringify({ event: "create_form_misconfigured", env: c.env.APP_ENV }));
    return c.json({ error: "form creation unavailable" }, 503);
  }
  if (await isRateLimited(c.env.AUTH_RATE_LIMITER, clientKey(c, "create-form"))) {
    return c.json({ error: "rate limit exceeded" }, 429);
  }
  if (!(await verifySecret(c.env.CREATE_TOKEN, bearerToken(c)))) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const body = await c.req.json().catch(() => null);
  const parsed = await formConfigFromCreateBody(c.env, body);
  if (!parsed.ok) return c.json({ error: parsed.error, issues: parsed.issues }, parsed.status as 400);
  const config = parsed.config;
  const createBody = body as { callbackUrl?: string; meta?: unknown; ttlDays?: unknown };

  await new FormRepository(c.env).saveForm(config, { callbackUrl: createBody.callbackUrl, meta: createBody.meta });

  const ttlDays = Math.min(30, Math.max(1, Number(createBody.ttlDays) || 7));
  const exp = Math.floor(Date.now() / 1000) + ttlDays * 86400;
  const token = await signSessionToken(c.env.SESSION_SECRET, { sub: config.id, exp, scope: "respond" });
  const studio = (c.env.STUDIO_BASE_URL ?? new URL(c.req.url).origin).replace(/\/$/, "");
  // Keep bearer material in the URL fragment so it is not sent in the initial HTTP
  // request, referrer, or static-asset logs. The responder passes it to the WS only.
  const responderUrl = `${studio}/respond/${config.id}#token=${encodeURIComponent(token)}`;
  return c.json({ formId: config.id, responderUrl, questions: config.questions.map((q) => q.prompt) });
});

/**
 * Authorize a WS session against the path subject and token scope. Browsers cannot
 * set headers on `new WebSocket`, so the token rides the upgrade query string.
 */
async function authorized(
  c: { env: Env; req: { query: (k: string) => string | undefined } },
  sub: string,
  scope: SessionClaims["scope"],
): Promise<boolean> {
  const secret = c.env.SESSION_SECRET;
  if (!secret) return false;
  const claims = await verifySessionToken(secret, c.req.query("token") ?? "");
  return !!claims && claims.sub === sub && claims.scope === scope;
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
  if (!SESSION_ID_RE.test(formId)) return c.text("invalid form", 400);
  if (!(await authorized(c, formId, "respond"))) return c.text("unauthorized", 401);
  if (await isRateLimited(c.env.PUBLIC_RATE_LIMITER, clientKey(c, "respond-session"))) {
    return c.text("rate limit exceeded", 429);
  }
  if (!(await new FormRepository(c.env).formExists(formId))) return c.text("form not found", 404);
  const sessionId = c.req.query("session") ?? crypto.randomUUID();
  if (!SESSION_ID_RE.test(sessionId)) return c.text("invalid session", 400);
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
  if (!SESSION_ID_RE.test(sessionId)) return c.text("invalid session", 400);
  if (!(await authorized(c, sessionId, "authoring"))) return c.text("unauthorized", 401);
  if (await isRateLimited(c.env.PUBLIC_RATE_LIMITER, clientKey(c, "authoring-session"))) {
    return c.text("rate limit exceeded", 429);
  }
  const id = c.env.FORM_AUTHORING.idFromName(sessionId);
  return c.env.FORM_AUTHORING.get(id).fetch(c.req.raw);
});

export default app;
