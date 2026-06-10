/** Stable authoring sessionId so reloading resumes the same draft (the DO is keyed by it). */

const SESSION_KEY = "fucktyping.authoring.sessionId";

/** Storage-like subset so callers can pass a fake in tests. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Returns the persisted sessionId, creating and storing one on first use.
 * Pure aside from the injected storage — pass `window.localStorage` in the app.
 */
export function getOrCreateSessionId(storage: StorageLike): string {
  const existing = storage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storage.setItem(SESSION_KEY, id);
  return id;
}

/** Decode the `sub` claim from a session token (no verification — that's the server's
 *  job). When the worker enforces auth, the sessionId must equal the token's sub, so a
 *  deployed studio derives its sessionId from the baked token. */
export function subFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[0];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const sub = JSON.parse(json)?.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}
