import { describe, expect, it } from "vitest";

import { parseServerMessage, websocketProtocols } from "./protocol";

describe("authoring server protocol", () => {
  it("moves WebSocket bearer material out of the URL", () => {
    expect(websocketProtocols("payload.signature")).toEqual([
      "fucktyping",
      "fucktyping-auth.payload.signature",
    ]);
  });

  it("accepts a published form only when it includes a usable signed-link contract", () => {
    expect(parseServerMessage(JSON.stringify({
      type: "published",
      formId: "form-1",
      responderUrl: "https://studio.example.com/respond/form-1#token=signed",
      expiresAt: "2026-09-09T12:00:00.000Z",
    }))).toEqual({
      type: "published",
      formId: "form-1",
      responderUrl: "https://studio.example.com/respond/form-1#token=signed",
      expiresAt: "2026-09-09T12:00:00.000Z",
    });

    expect(parseServerMessage(JSON.stringify({ type: "published", formId: "form-1" }))).toBeNull();
  });

  it("validates nested snapshot data before exposing it to React", () => {
    const snapshot = {
      type: "snapshot",
      form: {
        id: "form-1",
        name: "Check-in",
        openingActivity: { prompt: "Hello" },
        questions: [{
          id: "q1",
          prompt: "How are you?",
          expectedResponseFormat: "text",
          required: true,
          maxAttempts: 3,
        }],
        closingActivity: { prompt: "Thanks" },
      },
      messages: [{ role: "assistant", content: "Ready." }],
      ready: true,
    };
    expect(parseServerMessage(JSON.stringify(snapshot))).toMatchObject(snapshot);
    expect(parseServerMessage(JSON.stringify({ ...snapshot, form: { ...snapshot.form, questions: [{}] } }))).toBeNull();
    expect(parseServerMessage(JSON.stringify({ ...snapshot, messages: [{ role: "system", content: "no" }] }))).toBeNull();
  });
});
