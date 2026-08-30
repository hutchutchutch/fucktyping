/** Stable authoring sessionId so reloading resumes the same draft (the DO is keyed by it). */

const SESSION_KEY = "fucktyping.authoring.sessionId";
const TOKEN_KEY = "fucktyping.authoring.token";

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
  return claimsFromToken(token)?.sub ?? null;
}

interface BrowserTokenClaims {
  sub: string;
  exp: number;
  scope: string;
}

function claimsFromToken(token: string): BrowserTokenClaims | null {
  try {
    const payload = token.split(".")[0];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized + "=".repeat((4 - (normalized.length % 4)) % 4));
    const claims = JSON.parse(json) as Partial<BrowserTokenClaims>;
    if (typeof claims.sub !== "string" || typeof claims.exp !== "number" || typeof claims.scope !== "string") return null;
    return claims as BrowserTokenClaims;
  } catch {
    return null;
  }
}

/** Reads a non-expired creator token for this exact browser session. The server still
 * verifies its signature; this check only prevents reconnect loops with stale tokens. */
export function getStoredCreatorToken(storage: StorageLike, sessionId: string, now = Date.now()): string | null {
  const token = storage.getItem(TOKEN_KEY) ?? "";
  const claims = claimsFromToken(token);
  if (!claims || claims.sub !== sessionId || claims.scope !== "authoring" || claims.exp * 1000 <= now) return null;
  return token;
}

export function storeCreatorToken(storage: StorageLike, token: string): void {
  storage.setItem(TOKEN_KEY, token);
}

export function clearCreatorToken(storage: StorageLike): void {
  storage.setItem(TOKEN_KEY, "");
}
