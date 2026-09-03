import { describe, expect, it } from "vitest";

import { parseResponderMessage } from "./protocol";

describe("responder protocol", () => {
  it("accepts the exact assistant reply shape", () => {
    expect(parseResponderMessage(JSON.stringify({ type: "assistant", text: "Question?", done: false })))
      .toEqual({ type: "assistant", text: "Question?", done: false });
  });

  it("rejects malformed or oversized messages", () => {
    expect(parseResponderMessage(JSON.stringify({ type: "assistant", text: 1, done: false }))).toBeNull();
    expect(parseResponderMessage(JSON.stringify({ type: "assistant", text: "x".repeat(10_001), done: false }))).toBeNull();
    expect(parseResponderMessage("not json")).toBeNull();
  });
});
