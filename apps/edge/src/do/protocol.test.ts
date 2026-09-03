import { describe, expect, it } from "vitest";

import { parseClientMessage } from "./protocol";

describe("response WebSocket protocol limits", () => {
  it("does not carry client-supplied form identity into the trusted message", () => {
    expect(parseClientMessage(JSON.stringify({ type: "start", form_id: "other-form" }))).toEqual({
      type: "start",
    });
  });

  it("trims bounded answers", () => {
    expect(parseClientMessage(JSON.stringify({ type: "user_answer", text: "  hello  " }))).toEqual({
      type: "user_answer",
      text: "hello",
    });
  });

  it("rejects empty and oversized answers", () => {
    expect(parseClientMessage(JSON.stringify({ type: "user_answer", text: "   " }))).toBeNull();
    expect(parseClientMessage(JSON.stringify({ type: "user_answer", text: "x".repeat(5001) }))).toBeNull();
    expect(parseClientMessage("x".repeat(65 * 1024))).toBeNull();
  });
});
