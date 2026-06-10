import { describe, expect, it } from "vitest";

import { llmHeaders } from "./llm-headers";

describe("llmHeaders", () => {
  it("always sets content-type", () => {
    expect(llmHeaders({})).toEqual({ "content-type": "application/json" });
  });
  it("adds a bearer key when present", () => {
    expect(llmHeaders({ apiKey: "k" }).authorization).toBe("Bearer k");
  });
  it("adds CF-Access headers only when BOTH id and secret are present", () => {
    expect(llmHeaders({ cfAccessClientId: "id" })["CF-Access-Client-Id"]).toBeUndefined();
    const h = llmHeaders({ cfAccessClientId: "id", cfAccessClientSecret: "sec" });
    expect(h["CF-Access-Client-Id"]).toBe("id");
    expect(h["CF-Access-Client-Secret"]).toBe("sec");
  });
});
