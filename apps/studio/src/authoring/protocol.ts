import type { AuthoringServerMessage } from "./types";

/** Client → DO message builders. */
export const initMsg = (): string => JSON.stringify({ type: "init" });
export const userMsg = (text: string): string => JSON.stringify({ type: "user_message", text });
export const publishMsg = (): string => JSON.stringify({ type: "publish" });

/** Defensive parse of a DO → client message (no zod; trust-but-verify the shapes). */
export function parseServerMessage(raw: unknown): AuthoringServerMessage | null {
  if (typeof raw !== "string") return null;
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;

  switch (data.type) {
    case "snapshot":
      if (data.form && Array.isArray(data.messages)) {
        return { type: "snapshot", form: data.form, messages: data.messages, ready: Boolean(data.ready) };
      }
      return null;
    case "thinking":
      return { type: "thinking" };
    case "published":
      return typeof data.formId === "string" ? { type: "published", formId: data.formId } : null;
    case "error":
      return { type: "error", message: typeof data.message === "string" ? data.message : "error" };
    default:
      return null;
  }
}

/** http(s)://host → ws(s)://host, so callers can pass a normal base URL. */
export function toWsUrl(httpBase: string): string {
  return httpBase.replace(/^http/, "ws").replace(/\/$/, "");
}
