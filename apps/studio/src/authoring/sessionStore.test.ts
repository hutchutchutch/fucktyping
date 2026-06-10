import { describe, expect, it } from "vitest";

import { getOrCreateSessionId, type StorageLike } from "./sessionStore";

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
