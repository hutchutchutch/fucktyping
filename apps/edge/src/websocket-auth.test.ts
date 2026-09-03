import { describe, expect, it } from "vitest";

import { selectedWebSocketProtocol, webSocketToken } from "./websocket-auth";

describe("WebSocket subprotocol authentication", () => {
  it("extracts bearer material from a dedicated subprotocol", () => {
    expect(webSocketToken("fucktyping, fucktyping-auth.payload.signature")).toBe("payload.signature");
  });

  it("does not accept query-style or malformed protocol values", () => {
    expect(webSocketToken(null)).toBe("");
    expect(webSocketToken("fucktyping")).toBe("");
    expect(webSocketToken("fucktyping-auth.")).toBe("");
  });

  it("selects only the public application protocol", () => {
    expect(selectedWebSocketProtocol("fucktyping, fucktyping-auth.secret")).toBe("fucktyping");
    expect(selectedWebSocketProtocol("other")).toBeNull();
  });
});
