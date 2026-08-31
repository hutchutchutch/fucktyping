import { describe, expect, it } from "vitest";

import { parseAuthoringClientMessage } from "./protocol";

describe("authoring WebSocket protocol limits", () => {
  it("trims bounded creator messages", () => {
    expect(parseAuthoringClientMessage(JSON.stringify({ type: "user_message", text: "  build a check-in  " }))).toEqual({
      type: "user_message",
      text: "build a check-in",
    });
  });

  it("rejects empty and oversized creator messages", () => {
    expect(parseAuthoringClientMessage(JSON.stringify({ type: "user_message", text: "" }))).toBeNull();
    expect(parseAuthoringClientMessage(JSON.stringify({ type: "user_message", text: "x".repeat(5001) }))).toBeNull();
  });
});
