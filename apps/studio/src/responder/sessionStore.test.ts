import { describe, expect, it } from "vitest";

import { resolveResponderAccess, type StorageLike } from "./sessionStore";

function fakeStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
  };
}

function unsignedToken(claims: object): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${payload}.signature`;
}

describe("respondent access storage", () => {
  it("captures a fragment token and reuses its per-tab session after reload", () => {
    const storage = fakeStorage();
    const token = unsignedToken({ sub: "form-1", scope: "respond", exp: 2_000_000_000 });
    const first = resolveResponderAccess(storage, "form-1", token, 1_900_000_000_000);
    const resumed = resolveResponderAccess(storage, "form-1", undefined, 1_900_000_000_000);

    expect(first?.token).toBe(token);
    expect(first?.sessionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(resumed).toEqual(first);
  });

  it("rejects expired, wrong-form, and wrong-scope tokens", () => {
    const storage = fakeStorage();
    expect(resolveResponderAccess(storage, "form-1", unsignedToken({ sub: "form-1", scope: "respond", exp: 10 }), 11_000)).toBeNull();
    expect(resolveResponderAccess(storage, "form-1", unsignedToken({ sub: "form-2", scope: "respond", exp: 2_000_000_000 }))).toBeNull();
    expect(resolveResponderAccess(storage, "form-1", unsignedToken({ sub: "form-1", scope: "authoring", exp: 2_000_000_000 }))).toBeNull();
  });

  it("starts a new session when a different valid link is opened", () => {
    const storage = fakeStorage();
    const firstToken = unsignedToken({ sub: "form-1", scope: "respond", exp: 2_000_000_000, nonce: "one" });
    const secondToken = unsignedToken({ sub: "form-1", scope: "respond", exp: 2_000_000_000, nonce: "two" });
    const first = resolveResponderAccess(storage, "form-1", firstToken)!;
    const second = resolveResponderAccess(storage, "form-1", secondToken)!;
    expect(second.sessionId).not.toBe(first.sessionId);
  });
});
