import { describe, expect, it } from "vitest";

import app from "./app";
import { verifySessionToken } from "./auth";
import type { Env } from "./env";

const SESSION_SECRET = "session-secret-for-tests";
const CREATE_TOKEN = "creator-access-key";

function authEnv(options: { allowed?: boolean; configured?: boolean } = {}): Env {
  const configured = options.configured ?? true;
  return {
    APP_ENV: "staging",
    CREATE_TOKEN: configured ? CREATE_TOKEN : undefined,
    SESSION_SECRET: configured ? SESSION_SECRET : undefined,
    AUTH_RATE_LIMITER: {
      limit: async () => ({ success: options.allowed ?? true }),
    },
  } as unknown as Env;
}

async function login(body: unknown, env = authEnv()): Promise<Response> {
  return app.request(
    "/auth/creator",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    env,
  );
}

describe("POST /auth/creator", () => {
  it("exchanges the access key for a scoped token", async () => {
    const response = await login({ accessToken: CREATE_TOKEN, sessionId: "browser-session_1" });
    expect(response.status).toBe(200);
    const body = await response.json() as { token: string; expiresAt: string };
    const claims = await verifySessionToken(SESSION_SECRET, body.token);
    expect(claims?.sub).toBe("browser-session_1");
    expect(claims?.scope).toBe("authoring");
    expect(Date.parse(body.expiresAt)).toBeGreaterThan(Date.now());
  });

  it("rejects an incorrect access key without minting a token", async () => {
    const response = await login({ accessToken: "wrong", sessionId: "browser-session_1" });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "invalid access key" });
  });

  it("validates session identifiers", async () => {
    expect((await login({ accessToken: CREATE_TOKEN, sessionId: "bad/session" })).status).toBe(400);
    expect((await login({ accessToken: CREATE_TOKEN, sessionId: "x".repeat(129) })).status).toBe(400);
  });

  it("fails closed when secrets are missing or the caller is rate limited", async () => {
    expect((await login({ accessToken: CREATE_TOKEN, sessionId: "session" }, authEnv({ configured: false }))).status).toBe(503);
    expect((await login({ accessToken: CREATE_TOKEN, sessionId: "session" }, authEnv({ allowed: false }))).status).toBe(429);
  });
});

describe("protected APIs", () => {
  it("rejects unauthenticated form listing and transcription before touching bindings", async () => {
    const env = authEnv();
    const forms = await app.request("/forms", {}, env);
    expect(forms.status).toBe(401);

    const transcribe = await app.request("/transcribe", {
      method: "POST",
      headers: { "content-type": "audio/wav" },
      body: new Uint8Array([1, 2, 3]),
    }, env);
    expect(transcribe.status).toBe(401);
  });
});
