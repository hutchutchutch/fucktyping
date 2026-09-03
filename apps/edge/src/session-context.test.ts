import { describe, expect, it } from "vitest";

import {
  parseAuthoringConnection,
  parseResponseConnection,
} from "./session-context";

describe("hibernation-safe connection context", () => {
  it("accepts only a complete response attachment", () => {
    expect(parseResponseConnection({
      kind: "response",
      formId: "form-1",
      sessionId: "session_1",
      expiresAt: 2_000_000_000,
    })).toEqual({ kind: "response", formId: "form-1", sessionId: "session_1", expiresAt: 2_000_000_000 });

    expect(parseResponseConnection({ kind: "response", formId: "form-1" })).toBeNull();
    expect(parseResponseConnection({ kind: "authoring", formId: "form-1", sessionId: "session_1" })).toBeNull();
  });

  it("accepts only a complete authoring attachment", () => {
    expect(parseAuthoringConnection({
      kind: "authoring",
      ownerId: "private-beta",
      responderBaseUrl: "https://studio.example.com",
      expiresAt: 2_000_000_000,
    })).toEqual({
      kind: "authoring",
      ownerId: "private-beta",
      responderBaseUrl: "https://studio.example.com",
      expiresAt: 2_000_000_000,
    });

    expect(parseAuthoringConnection({ kind: "authoring", ownerId: "private-beta" })).toBeNull();
    expect(parseAuthoringConnection(null)).toBeNull();
  });
});
