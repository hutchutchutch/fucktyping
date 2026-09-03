import { describe, expect, it } from "vitest";

import { verifySessionToken } from "./auth";
import { createResponderLink, responderBaseUrl } from "./respondent-link";

describe("respondent links", () => {
  it("mints a form-scoped token in the URL fragment", async () => {
    const result = await createResponderLink(
      "session-secret",
      "form-1",
      "https://studio.example.com/",
      7,
      1_800_000_000,
    );
    const url = new URL(result.responderUrl);
    const token = new URLSearchParams(url.hash.slice(1)).get("token");

    expect(`${url.origin}${url.pathname}`).toBe("https://studio.example.com/respond/form-1");
    expect(result.expiresAt).toBe(new Date((1_800_000_000 + 7 * 86_400) * 1000).toISOString());
    expect(await verifySessionToken("session-secret", token ?? "")).toEqual({
      sub: "form-1",
      exp: 1_800_000_000 + 7 * 86_400,
      scope: "respond",
    });
  });

  it("uses configured Studio URL before the request origin", () => {
    expect(responderBaseUrl("https://forms.example.com/", "https://worker.example.workers.dev/path"))
      .toBe("https://forms.example.com");
    expect(responderBaseUrl(undefined, "https://worker.example.workers.dev/path"))
      .toBe("https://worker.example.workers.dev");
  });

  it("rejects insecure public or ambiguous configured URLs", () => {
    expect(() => responderBaseUrl("http://forms.example.com", "https://worker.example/path")).toThrow();
    expect(() => responderBaseUrl("https://forms.example.com?target=other", "https://worker.example/path")).toThrow();
    expect(responderBaseUrl("http://localhost:5173/", "https://worker.example/path"))
      .toBe("http://localhost:5173");
  });
});
