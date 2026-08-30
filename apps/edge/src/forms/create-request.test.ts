import { describe, expect, it } from "vitest";

import { formConfigFromCreateBody, formOptionsFromCreateBody } from "./create-request";

const config = {
  id: "gtky-test",
  name: "GTKY Test",
  openingActivity: { prompt: "Opening." },
  questions: [
    {
      id: "q1",
      prompt: "Context first. What matters today?",
      expectedResponseFormat: "text",
      required: true,
      maxAttempts: 3,
    },
  ],
  closingActivity: { prompt: "Done." },
};

describe("formConfigFromCreateBody", () => {
  it("accepts an explicit FormConfig", async () => {
    const result = await formConfigFromCreateBody({} as any, { config });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.id).toBe("gtky-test");
      expect(result.config.questions[0].prompt).toBe("Context first. What matters today?");
    }
  });

  it("rejects invalid explicit configs", async () => {
    const result = await formConfigFromCreateBody({} as any, { config: { id: "bad" } });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toBe("invalid config");
    }
  });
});

describe("formOptionsFromCreateBody", () => {
  it("normalizes a bounded response-link TTL and accepts HTTPS callbacks", () => {
    const result = formOptionsFromCreateBody({
      callbackUrl: "https://hooks.example.com/complete",
      ttlDays: "14",
      meta: { channel: "test" },
    });
    expect(result).toEqual({
      ok: true,
      options: {
        callbackUrl: "https://hooks.example.com/complete",
        ttlDays: 14,
        meta: { channel: "test" },
      },
    });
  });

  it("rejects insecure callbacks, excessive TTLs, and oversized metadata", () => {
    expect(formOptionsFromCreateBody({ callbackUrl: "http://localhost/hook" }).ok).toBe(false);
    expect(formOptionsFromCreateBody({ ttlDays: 31 }).ok).toBe(false);
    expect(formOptionsFromCreateBody({ meta: "x".repeat(17_000) }).ok).toBe(false);
  });
});
