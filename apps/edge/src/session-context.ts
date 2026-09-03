export const TRUSTED_FORM_HEADER = "X-FuckTyping-Form";
export const TRUSTED_SESSION_HEADER = "X-FuckTyping-Session";
export const TRUSTED_OWNER_HEADER = "X-FuckTyping-Owner";
export const TRUSTED_RESPONDER_BASE_HEADER = "X-FuckTyping-Responder-Base";
export const TRUSTED_EXPIRY_HEADER = "X-FuckTyping-Expires";

const SESSION_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export interface ResponseConnection {
  kind: "response";
  formId: string;
  sessionId: string;
  expiresAt: number;
}

export interface AuthoringConnection {
  kind: "authoring";
  ownerId: string;
  responderBaseUrl: string;
  expiresAt: number;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : null;
}

export function isSessionIdentifier(value: unknown): value is string {
  return typeof value === "string" && SESSION_ID_RE.test(value);
}

export function parseResponseConnection(value: unknown): ResponseConnection | null {
  const data = record(value);
  if (
    data?.kind !== "response"
    || !isSessionIdentifier(data.formId)
    || !isSessionIdentifier(data.sessionId)
    || typeof data.expiresAt !== "number"
    || !Number.isSafeInteger(data.expiresAt)
    || data.expiresAt <= 0
  ) return null;
  return { kind: "response", formId: data.formId, sessionId: data.sessionId, expiresAt: data.expiresAt };
}

export function parseAuthoringConnection(value: unknown): AuthoringConnection | null {
  const data = record(value);
  if (
    data?.kind !== "authoring"
    || typeof data.ownerId !== "string"
    || data.ownerId.length === 0
    || data.ownerId.length > 256
    || typeof data.responderBaseUrl !== "string"
    || typeof data.expiresAt !== "number"
    || !Number.isSafeInteger(data.expiresAt)
    || data.expiresAt <= 0
  ) return null;

  try {
    const url = new URL(data.responderBaseUrl);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) return null;
  } catch {
    return null;
  }

  return {
    kind: "authoring",
    ownerId: data.ownerId,
    responderBaseUrl: data.responderBaseUrl.replace(/\/+$/, ""),
    expiresAt: data.expiresAt,
  };
}
