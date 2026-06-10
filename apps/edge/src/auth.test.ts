import { describe, expect, it } from "vitest";

import { signSessionToken, verifySessionToken } from "./auth";

const SECRET = "test-secret";
const future = Math.floor(Date.now() / 1000) + 3600;

describe("session tokens", () => {
  it("round-trips claims through sign/verify", async () => {
    const token = await signSessionToken(SECRET, { sub: "sess-1", exp: future });
    expect(token).toMatch(/^[\w-]+\.[\w-]+$/);
    const claims = await verifySessionToken(SECRET, token);
    expect(claims).toEqual({ sub: "sess-1", exp: future });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken(SECRET, { sub: "sess-1", exp: future });
    expect(await verifySessionToken("other-secret", token)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await signSessionToken(SECRET, { sub: "sess-1", exp: future });
    const tampered = `${token.split(".")[0]}x.${token.split(".")[1]}`;
    expect(await verifySessionToken(SECRET, tampered)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signSessionToken(SECRET, { sub: "sess-1", exp: 1 });
    expect(await verifySessionToken(SECRET, token)).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await verifySessionToken(SECRET, "not-a-token")).toBeNull();
    expect(await verifySessionToken(SECRET, ".")).toBeNull();
  });
});
