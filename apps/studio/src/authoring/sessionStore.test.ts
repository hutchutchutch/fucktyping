import { describe, expect, it } from "vitest";

import {
  clearCreatorToken,
  getOrCreateSessionId,
  getStoredCreatorToken,
  storeCreatorToken,
  type StorageLike,
} from "./sessionStore";

function fakeStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
  };
}

describe("getOrCreateSessionId", () => {
  it("creates and persists an id on first use", () => {
    const storage = fakeStorage();
    const id = getOrCreateSessionId(storage);
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(storage.getItem("fucktyping.authoring.sessionId")).toBe(id);
  });

  it("returns the same id on subsequent calls (resumes the draft)", () => {
    const storage = fakeStorage();
    const first = getOrCreateSessionId(storage);
    const second = getOrCreateSessionId(storage);
    expect(second).toBe(first);
  });

  it("reuses a pre-existing stored id", () => {
    const storage = fakeStorage();
    storage.setItem("fucktyping.authoring.sessionId", "preset-id");
    expect(getOrCreateSessionId(storage)).toBe("preset-id");
  });
});

function unsignedToken(claims: object): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${payload}.signature`;
}

describe("creator token storage", () => {
  it("returns a current authoring token for the matching session", () => {
    const storage = fakeStorage();
    const token = unsignedToken({ sub: "session-1", scope: "authoring", exp: 2_000_000_000 });
    storeCreatorToken(storage, token);
    expect(getStoredCreatorToken(storage, "session-1", 1_900_000_000_000)).toBe(token);
  });

  it("rejects expired, wrong-session, and respondent tokens", () => {
    const storage = fakeStorage();
    storeCreatorToken(storage, unsignedToken({ sub: "session-1", scope: "authoring", exp: 10 }));
    expect(getStoredCreatorToken(storage, "session-1", 11_000)).toBeNull();

    storeCreatorToken(storage, unsignedToken({ sub: "session-2", scope: "authoring", exp: 2_000_000_000 }));
    expect(getStoredCreatorToken(storage, "session-1")).toBeNull();

    storeCreatorToken(storage, unsignedToken({ sub: "session-1", scope: "respond", exp: 2_000_000_000 }));
    expect(getStoredCreatorToken(storage, "session-1")).toBeNull();
  });

  it("clears the stored token", () => {
    const storage = fakeStorage();
    storeCreatorToken(storage, unsignedToken({ sub: "session-1", scope: "authoring", exp: 2_000_000_000 }));
    clearCreatorToken(storage);
    expect(getStoredCreatorToken(storage, "session-1")).toBeNull();
  });
});
