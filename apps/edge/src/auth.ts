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
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(s: string): Uint8Array {
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

/** Constant-time-ish comparison to avoid leaking the signature via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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
  if (typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const key = await importKey(secret);
  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  if (!timingSafeEqual(sig, base64urlEncode(new Uint8Array(expected)))) return null;

  let claims: SessionClaims;
  try {
    claims = JSON.parse(decoder.decode(base64urlDecode(payload)));
  } catch {
    return null;
  }
  if (!claims || typeof claims.sub !== "string" || typeof claims.exp !== "number") return null;
  if (claims.exp <= Math.floor(Date.now() / 1000)) return null;
  return claims;
}
