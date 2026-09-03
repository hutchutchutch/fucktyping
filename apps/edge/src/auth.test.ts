import { describe, expect, it } from "vitest";

import { signSessionToken, verifySecret, verifySessionToken } from "./auth";

const SECRET = "test-secret";
const future = Math.floor(Date.now() / 1000) + 3600;

describe("session tokens", () => {
  it("round-trips claims through sign/verify", async () => {
    const token = await signSessionToken(SECRET, { sub: "sess-1", exp: future, scope: "authoring" });
    expect(token).toMatch(/^[\w-]+\.[\w-]+$/);
    const claims = await verifySessionToken(SECRET, token);
    expect(claims).toEqual({ sub: "sess-1", exp: future, scope: "authoring" });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken(SECRET, { sub: "sess-1", exp: future, scope: "authoring" });
    expect(await verifySessionToken("other-secret", token)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await signSessionToken(SECRET, { sub: "sess-1", exp: future, scope: "authoring" });
    const tampered = `${token.split(".")[0]}x.${token.split(".")[1]}`;
    expect(await verifySessionToken(SECRET, tampered)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signSessionToken(SECRET, { sub: "sess-1", exp: 1, scope: "authoring" });
    expect(await verifySessionToken(SECRET, token)).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await verifySessionToken(SECRET, "not-a-token")).toBeNull();
    expect(await verifySessionToken(SECRET, ".")).toBeNull();
    expect(await verifySessionToken(SECRET, "a.b.c")).toBeNull();
    expect(await verifySessionToken(SECRET, "x".repeat(4097))).toBeNull();
  });

  it("rejects signed tokens whose claims do not match the session contract", async () => {
    const invalidSubject = await signSessionToken(SECRET, {
      sub: "bad/subject",
      exp: future,
      scope: "respond",
    });
    const invalidExpiry = await signSessionToken(SECRET, {
      sub: "form-1",
      exp: Number.NaN,
      scope: "respond",
    });
    expect(await verifySessionToken(SECRET, invalidSubject)).toBeNull();
    expect(await verifySessionToken(SECRET, invalidExpiry)).toBeNull();
  });
});

describe("access-key verification", () => {
  it("accepts only the matching secret", async () => {
    expect(await verifySecret(SECRET, SECRET)).toBe(true);
    expect(await verifySecret(SECRET, "wrong-secret")).toBe(false);
    expect(await verifySecret(SECRET, "")).toBe(false);
  });
});
