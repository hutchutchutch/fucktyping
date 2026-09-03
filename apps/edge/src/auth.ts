/**
 * Dependency-free signed session tokens for gating the WS sessions.
 *
 * Format:  base64url(payloadJSON) "." base64url(HMAC-SHA256(payloadB64))
 * Claims:  { sub: string; exp: number }   (exp = unix seconds)
 *
 * Web Crypto (SubtleCrypto) only — runs in Workers and in Node 22 (global `crypto`).
 */

export interface SessionClaims {
  /** Subject — e.g. the sessionId or formId the token authorizes. */
  sub: string;
  /** Expiry, unix seconds. */
  exp: number;
  /** Prevents a creator token from being reused as a respondent token, or vice versa. */
  scope: "authoring" | "respond";
  /** Stable private-beta tenant. Authoring session IDs remain browser-specific. */
  owner?: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(s: string): Uint8Array {
  if (!s || !/^[A-Za-z0-9_-]+$/.test(s)) throw new Error("invalid base64url");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Mints a compact `payload.signature` token. */
export async function signSessionToken(secret: string, claims: SessionClaims): Promise<string> {
  const payload = base64urlEncode(encoder.encode(JSON.stringify(claims)));
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${base64urlEncode(new Uint8Array(sig))}`;
}

/** Verifies signature + expiry. Returns the claims, or null if invalid/expired. */
export async function verifySessionToken(
  secret: string,
  token: string,
): Promise<SessionClaims | null> {
  if (typeof token !== "string" || token.length > 4096) return null;
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1 || token.indexOf(".", dot + 1) !== -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const key = await importKey(secret);
  let signature: Uint8Array;
  try {
    signature = base64urlDecode(sig);
  } catch {
    return null;
  }
  if (!(await crypto.subtle.verify("HMAC", key, signature, encoder.encode(payload)))) return null;

  let value: unknown;
  try {
    value = JSON.parse(decoder.decode(base64urlDecode(payload))) as unknown;
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const claims = value as Record<string, unknown>;
  if (
    typeof claims.sub !== "string"
    || !/^[A-Za-z0-9_-]{1,128}$/.test(claims.sub)
    || typeof claims.exp !== "number"
    || !Number.isSafeInteger(claims.exp)
    || (claims.scope !== "authoring" && claims.scope !== "respond")
    || (claims.owner !== undefined && (typeof claims.owner !== "string" || claims.owner.length === 0 || claims.owner.length > 256))
  ) return null;
  if (claims.exp <= Math.floor(Date.now() / 1000)) return null;
  return {
    sub: claims.sub,
    exp: claims.exp,
    scope: claims.scope,
    owner: claims.owner as string | undefined,
  };
}

/** Compares access keys without an early-exit string comparison. */
export async function verifySecret(expected: string, candidate: string): Promise<boolean> {
  if (!expected || !candidate || candidate.length > 1024) return false;
  const message = encoder.encode("fucktyping access-key verification");
  const expectedKey = await importKey(expected);
  const candidateKey = await importKey(candidate);
  const candidateMac = await crypto.subtle.sign("HMAC", candidateKey, message);
  return crypto.subtle.verify("HMAC", expectedKey, candidateMac, message);
}
