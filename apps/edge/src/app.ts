import { Hono } from "hono";
import { cors } from "hono/cors";

import { signSessionToken, verifySecret, verifySessionToken } from "./auth";
import type { SessionClaims } from "./auth";
import type { Env } from "./env";
import { formConfigFromCreateBody, formOptionsFromCreateBody } from "./forms/create-request";
import { FormRepository } from "./forms/repository";
import { readBoundedBytes, readBoundedJson } from "./http/body";
import { createResponderLink, responderBaseUrl } from "./respondent-link";
import {
  isSessionIdentifier,
  TRUSTED_EXPIRY_HEADER,
  TRUSTED_FORM_HEADER,
  TRUSTED_OWNER_HEADER,
  TRUSTED_RESPONDER_BASE_HEADER,
  TRUSTED_SESSION_HEADER,
} from "./session-context";
import { webSocketToken } from "./websocket-auth";

const app = new Hono<{ Bindings: Env }>();
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_AUTH_BODY_BYTES = 4 * 1024;
const MAX_FORM_BODY_BYTES = 256 * 1024;

const devCors = cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  allowHeaders: ["Authorization", "Content-Type"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  maxAge: 86400,
});

app.use("/auth/*", devCors);
app.use("/transcribe", devCors);
app.use("/forms", devCors);
app.use("/forms/*", devCors);

app.use("*", async (c, next) => {
  const startedAt = Date.now();
  await next();
  console.log(JSON.stringify({
    event: "request_completed",
    env: c.env.APP_ENV,
    versionId: c.env.CF_VERSION_METADATA.id,
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    status: c.res.status,
    durationMs: Date.now() - startedAt,
    rayId: c.req.header("CF-Ray") ?? null,
  }));
});

app.get("/health", (c) => {
  const configured = Boolean(c.env.SESSION_SECRET && c.env.CREATE_TOKEN && c.env.WEBHOOK_SIGNING_SECRET);
  return c.json({
    status: configured ? "ok" : "degraded",
    env: c.env.APP_ENV,
    versionId: c.env.CF_VERSION_METADATA.id,
  }, configured ? 200 : 503);
});

app.onError((error, c) => {
  console.error(JSON.stringify({
    event: "request_failed",
    env: c.env.APP_ENV,
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    rayId: c.req.header("CF-Ray") ?? null,
    error: error.message,
  }));
  return c.json({ error: "internal error" }, 500);
});

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

  const body = await readBoundedJson(c.req.raw, MAX_AUTH_BODY_BYTES);
  if (!body.ok) return c.json({ error: body.error }, body.status);
  const value = body.value && typeof body.value === "object" ? body.value as Record<string, unknown> : null;
  const accessToken = typeof value?.accessToken === "string" ? value.accessToken : "";
  const sessionId = typeof value?.sessionId === "string" ? value.sessionId : "";
  if (!isSessionIdentifier(sessionId)) return c.json({ error: "invalid session" }, 400);
  if (!(await verifySecret(c.env.CREATE_TOKEN, accessToken))) {
    return c.json({ error: "invalid access key" }, 401);
  }

  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const token = await signSessionToken(c.env.SESSION_SECRET, {
    sub: sessionId,
    exp,
    scope: "authoring",
    owner: "private-beta",
  });
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
  const body = await readBoundedBytes(c.req.raw, MAX_AUDIO_BYTES);
  if (!body.ok) return c.json({ error: "audio too large" }, body.status);
  if (body.value.byteLength === 0) return c.json({ error: "no audio" }, 400);
  const result: unknown = await c.env.AI.run("@cf/openai/whisper", {
    audio: [...body.value],
  });
  const transcript = result && typeof result === "object" && !Array.isArray(result)
    ? (result as Record<string, unknown>).text
    : null;
  return c.json({ text: typeof transcript === "string" ? transcript : "" });
});

/** Published-forms list for the studio's "My forms" sidebar. */
app.get("/forms", async (c) => {
  c.header("Cache-Control", "no-store");
  const claims = await bearerClaims(c);
  if (claims?.scope !== "authoring" || !claims.owner) return c.json({ error: "unauthorized" }, 401);
  const forms = await new FormRepository(c.env).listForms(claims.owner);
  return c.json(forms);
});

/** Owner-scoped response list for the selected Studio form. */
app.get("/forms/:formId/responses", async (c) => {
  c.header("Cache-Control", "no-store");
  const claims = await bearerClaims(c);
  if (claims?.scope !== "authoring" || !claims.owner) return c.json({ error: "unauthorized" }, 401);
  const formId = c.req.param("formId");
  if (!isSessionIdentifier(formId)) return c.json({ error: "invalid form" }, 400);
  const repository = new FormRepository(c.env);
  const form = await repository.getOwnedFormConfig(formId, claims.owner);
  if (!form) return c.json({ error: "form not found" }, 404);
  const responses = await repository.listResponses(claims.owner, formId);
  return c.json({
    form: {
      id: form.id,
      name: form.name,
      questions: form.questions.map((question) => ({ id: question.id, prompt: question.prompt })),
    },
    responses,
  });
});

/** Mint a fresh share link for a form already owned by this creator tenant. */
app.post("/forms/:formId/link", async (c) => {
  c.header("Cache-Control", "no-store");
  const claims = await bearerClaims(c);
  if (claims?.scope !== "authoring" || !claims.owner || !c.env.SESSION_SECRET) {
    return c.json({ error: "unauthorized" }, 401);
  }
  if (await isRateLimited(c.env.PUBLIC_RATE_LIMITER, clientKey(c, "mint-link"))) {
    return c.json({ error: "rate limit exceeded" }, 429);
  }
  const formId = c.req.param("formId");
  if (!isSessionIdentifier(formId)) return c.json({ error: "invalid form" }, 400);
  const repository = new FormRepository(c.env);
  if (!(await repository.formOwnedBy(formId, claims.owner))) return c.json({ error: "form not found" }, 404);
  const link = await createResponderLink(
    c.env.SESSION_SECRET,
    formId,
    responderBaseUrl(c.env.STUDIO_BASE_URL, c.req.url),
  );
  return c.json({ formId, ...link });
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
  const body = await readBoundedJson(c.req.raw, MAX_FORM_BODY_BYTES);
  if (!body.ok) return c.json({ error: body.error }, body.status);
  const parsed = await formConfigFromCreateBody(c.env, body.value);
  if (!parsed.ok) return c.json({ error: parsed.error, issues: parsed.issues }, parsed.status as 400);
  const parsedOptions = formOptionsFromCreateBody(body.value);
  if (!parsedOptions.ok) return c.json({ error: "invalid form options", issues: parsedOptions.issues }, 400);
  const config = parsed.config;
  const createOptions = parsedOptions.options;
  if (createOptions.callbackUrl && !c.env.WEBHOOK_SIGNING_SECRET) {
    console.error(JSON.stringify({ event: "callback_signing_misconfigured", env: c.env.APP_ENV }));
    return c.json({ error: "callback delivery unavailable" }, 503);
  }

  await new FormRepository(c.env).saveForm(config, {
    ownerId: "private-beta",
    callbackUrl: createOptions.callbackUrl,
    meta: createOptions.meta,
  });

  const link = await createResponderLink(
    c.env.SESSION_SECRET,
    config.id,
    responderBaseUrl(c.env.STUDIO_BASE_URL, c.req.url),
    createOptions.ttlDays,
  );
  return c.json({ formId: config.id, ...link, questions: config.questions.map((q) => q.prompt) });
});

/**
 * Authorize a WS session against the path subject and token scope. Browsers cannot
 * set arbitrary headers on `new WebSocket`, so the token rides a dedicated WebSocket
 * subprotocol. This keeps bearer material out of request URLs and platform URL logs.
 */
async function authorized(
  c: { env: Env; req: { header: (k: string) => string | undefined } },
  sub: string,
  scope: SessionClaims["scope"],
): Promise<SessionClaims | null> {
  const secret = c.env.SESSION_SECRET;
  if (!secret) return null;
  const claims = await verifySessionToken(
    secret,
    webSocketToken(c.req.header("sec-websocket-protocol") ?? null),
  );
  return claims?.sub === sub && claims.scope === scope ? claims : null;
}

/**
 * WebSocket entry for a voice-form response session. The Mac voice pipeline
 * (do_client.py) connects here and drives the conversation.
 *
 *   GET /forms/:formId/session?session=<id>   (Upgrade: websocket + auth subprotocol)
 */
app.get("/forms/:formId/session", async (c) => {
  if (c.req.header("Upgrade") !== "websocket") {
    return c.text("expected websocket", 426);
  }
  const formId = c.req.param("formId");
  if (!isSessionIdentifier(formId)) return c.text("invalid form", 400);
  const claims = await authorized(c, formId, "respond");
  if (!claims) return c.text("unauthorized", 401);
  if (await isRateLimited(c.env.PUBLIC_RATE_LIMITER, clientKey(c, "respond-session"))) {
    return c.text("rate limit exceeded", 429);
  }
  if (!(await new FormRepository(c.env).formExists(formId))) return c.text("form not found", 404);
  const sessionId = c.req.query("session") ?? crypto.randomUUID();
  if (!isSessionIdentifier(sessionId)) return c.text("invalid session", 400);
  const id = c.env.FORM_SESSION.idFromName(`${formId}:${sessionId}`);
  const headers = new Headers(c.req.raw.headers);
  headers.set(TRUSTED_FORM_HEADER, formId);
  headers.set(TRUSTED_SESSION_HEADER, sessionId);
  headers.set(TRUSTED_EXPIRY_HEADER, String(claims.exp));
  return c.env.FORM_SESSION.get(id).fetch(new Request(c.req.raw, { headers }));
});

/**
 * WebSocket entry for a form-authoring session. The creator's browser connects here;
 * the DO broadcasts full state (chat + draft form) for the chat and live graph panes.
 *
 *   GET /authoring/:sessionId/session   (Upgrade: websocket + auth subprotocol)
 */
app.get("/authoring/:sessionId/session", async (c) => {
  if (c.req.header("Upgrade") !== "websocket") {
    return c.text("expected websocket", 426);
  }
  const sessionId = c.req.param("sessionId");
  if (!isSessionIdentifier(sessionId)) return c.text("invalid session", 400);
  const claims = await authorized(c, sessionId, "authoring");
  if (!claims?.owner) return c.text("unauthorized", 401);
  if (await isRateLimited(c.env.PUBLIC_RATE_LIMITER, clientKey(c, "authoring-session"))) {
    return c.text("rate limit exceeded", 429);
  }
  const id = c.env.FORM_AUTHORING.idFromName(sessionId);
  const headers = new Headers(c.req.raw.headers);
  headers.set(TRUSTED_OWNER_HEADER, claims.owner);
  headers.set(TRUSTED_EXPIRY_HEADER, String(claims.exp));
  headers.set(
    TRUSTED_RESPONDER_BASE_HEADER,
    responderBaseUrl(c.env.STUDIO_BASE_URL, c.req.url),
  );
  return c.env.FORM_AUTHORING.get(id).fetch(new Request(c.req.raw, { headers }));
});

export default app;
