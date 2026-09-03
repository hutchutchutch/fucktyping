import { signSessionToken } from "./auth";

const SECONDS_PER_DAY = 86_400;

export interface ResponderLink {
  responderUrl: string;
  expiresAt: string;
}

export function responderBaseUrl(configuredBaseUrl: string | undefined, requestUrl: string): string {
  const raw = configuredBaseUrl ?? new URL(requestUrl).origin;
  const url = new URL(raw);
  const localHttp = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  if (
    (url.protocol !== "https:" && !localHttp)
    || url.username
    || url.password
    || url.search
    || url.hash
  ) {
    throw new Error("invalid Studio base URL");
  }
  return url.toString().replace(/\/+$/, "");
}

/** Mint a form-scoped responder URL. Bearer material stays in the fragment so the
 * initial document and asset requests never receive it. */
export async function createResponderLink(
  secret: string,
  formId: string,
  baseUrl: string,
  ttlDays = 7,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<ResponderLink> {
  const exp = nowSeconds + ttlDays * SECONDS_PER_DAY;
  const token = await signSessionToken(secret, { sub: formId, exp, scope: "respond" });
  return {
    responderUrl: `${baseUrl.replace(/\/+$/, "")}/respond/${formId}#token=${encodeURIComponent(token)}`,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}
