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
