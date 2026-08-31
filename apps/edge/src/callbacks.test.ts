import { afterEach, describe, expect, it, vi } from "vitest";

import type { Env } from "./env";
import type { CallbackDelivery } from "./forms/repository";
import type { FormConfig } from "./forms/types";
import { buildCallbackPayload, deliverCallback } from "./callbacks";

const FORM: FormConfig = {
  id: "form-1",
  name: "Check-in",
  openingActivity: { prompt: "Hello" },
  questions: [
    { id: "q1", prompt: "Rating?", expectedResponseFormat: "number", required: true, maxAttempts: 3 },
    { id: "q2", prompt: "Anything else?", expectedResponseFormat: "text", required: false, maxAttempts: 3 },
  ],
  closingActivity: { prompt: "Thanks" },
};

const DELIVERY: CallbackDelivery = {
  id: "delivery-1",
  responseId: "response-1",
  formId: "form-1",
  callbackUrl: "https://hooks.example.com/complete",
  payload: JSON.stringify({ formId: "form-1" }),
  status: "processing",
  attempts: 1,
};

afterEach(() => vi.unstubAllGlobals());

describe("callback payloads", () => {
  it("builds the structured Hermes payload and readable summary", () => {
    const payload = buildCallbackPayload(FORM, { q1: 5 }, { discordChatId: "channel-1" });
    expect(payload).toMatchObject({
      formId: "form-1",
      formName: "Check-in",
      responses: { q1: 5 },
      discordChatId: "channel-1",
      meta: { discordChatId: "channel-1" },
    });
    expect(payload.summary).toBe("• Rating? → 5\n• Anything else? → (skipped)");
  });
});

describe("deliverCallback", () => {
  it("signs the exact body and sends an idempotency key without following redirects", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const env = { WEBHOOK_SIGNING_SECRET: "webhook-secret" } as unknown as Env;

    await deliverCallback(env, DELIVERY);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(DELIVERY.callbackUrl);
    expect(init.body).toBe(DELIVERY.payload);
    expect(init.redirect).toBe("manual");
    expect(init.headers).toMatchObject({
      "content-type": "application/json",
      "idempotency-key": "delivery-1",
    });
    expect((init.headers as Record<string, string>)["X-Hub-Signature-256"]).toMatch(/^sha256=[a-f0-9]{64}$/);
  });

  it("treats non-success responses as retryable failures", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 503 })));
    await expect(deliverCallback({} as Env, DELIVERY)).rejects.toThrow("HTTP 503");
  });

  it("does not follow callback redirects", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 302 })));
    await expect(deliverCallback({} as Env, DELIVERY)).rejects.toThrow("HTTP 302");
  });
});
