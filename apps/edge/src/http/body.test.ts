import { describe, expect, it } from "vitest";

import { readBoundedBytes, readBoundedJson } from "./body";

describe("bounded request bodies", () => {
  it("reads JSON only within the configured byte limit", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ value: "ok" }),
    });
    await expect(readBoundedJson(request, 64)).resolves.toEqual({ ok: true, value: { value: "ok" } });
  });

  it("rejects oversized declared and streamed bodies", async () => {
    const declared = new Request("https://example.com", {
      method: "POST",
      headers: { "content-length": "100" },
      body: "small",
    });
    await expect(readBoundedBytes(declared, 10)).resolves.toEqual({ ok: false, status: 413, error: "request body too large" });

    const streamed = new Request("https://example.com", { method: "POST", body: "x".repeat(11) });
    await expect(readBoundedBytes(streamed, 10)).resolves.toEqual({ ok: false, status: 413, error: "request body too large" });
  });

  it("rejects malformed JSON", async () => {
    const request = new Request("https://example.com", { method: "POST", body: "{" });
    await expect(readBoundedJson(request, 64)).resolves.toEqual({ ok: false, status: 400, error: "invalid JSON" });
  });
});
