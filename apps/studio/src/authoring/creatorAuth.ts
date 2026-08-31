export interface CreatorSession {
  token: string;
  expiresAt: string;
}

/** Exchanges the private-beta access key for a short-lived scoped token. */
export async function createCreatorSession(
  httpBase: string,
  accessToken: string,
  sessionId: string,
): Promise<CreatorSession> {
  const response = await fetch(`${httpBase.replace(/\/$/, "")}/auth/creator`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accessToken, sessionId }),
  });
  const body = await response.json().catch(() => ({})) as { token?: unknown; expiresAt?: unknown; error?: unknown };
  if (!response.ok) {
    const message = typeof body.error === "string" ? body.error : `authentication failed (${response.status})`;
    throw new Error(message);
  }
  if (typeof body.token !== "string" || typeof body.expiresAt !== "string") {
    throw new Error("invalid authentication response");
  }
  return { token: body.token, expiresAt: body.expiresAt };
}
