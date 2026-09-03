const ACCESS_KEY_PREFIX = "fucktyping.respondent.access.";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ResponderAccess {
  token: string;
  sessionId: string;
}

interface RespondentClaims {
  sub: string;
  scope: "respond";
  exp: number;
}

function claimsFromToken(token: string): RespondentClaims | null {
  if (token.length > 4096) return null;
  try {
    const payload = token.split(".")[0];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized + "=".repeat((4 - (normalized.length % 4)) % 4));
    const value = JSON.parse(decoded) as Record<string, unknown>;
    if (
      typeof value.sub !== "string"
      || value.scope !== "respond"
      || typeof value.exp !== "number"
    ) return null;
    return { sub: value.sub, scope: "respond", exp: value.exp };
  } catch {
    return null;
  }
}

function parseStoredAccess(raw: string | null): ResponderAccess | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    return typeof value.token === "string" && typeof value.sessionId === "string"
      ? { token: value.token, sessionId: value.sessionId }
      : null;
  } catch {
    return null;
  }
}

/** Capture a fragment token into per-tab storage and preserve the matching session ID
 * across reloads. The Worker remains responsible for signature verification. */
export function resolveResponderAccess(
  storage: StorageLike,
  formId: string,
  incomingToken?: string,
  now = Date.now(),
): ResponderAccess | null {
  const key = `${ACCESS_KEY_PREFIX}${formId}`;
  const stored = parseStoredAccess(storage.getItem(key));
  const token = incomingToken ?? stored?.token;
  if (!token) return null;
  const claims = claimsFromToken(token);
  if (!claims || claims.sub !== formId || claims.exp * 1000 <= now) {
    storage.setItem(key, "");
    return null;
  }

  const access = stored?.token === token
    ? stored
    : { token, sessionId: crypto.randomUUID() };
  storage.setItem(key, JSON.stringify(access));
  return access;
}
