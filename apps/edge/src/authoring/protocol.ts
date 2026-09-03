import type { ChatMessage, DraftFormConfig } from "./draft";

/** WebSocket contract for the authoring session (creator's browser <-> DO). */
export type AuthoringClientMessage =
  | { type: "init" }
  | { type: "new_form" }
  | { type: "load_form"; formId: string }
  | { type: "user_message"; text: string }
  | { type: "publish" };

export type AuthoringServerMessage =
  /** Full state — the chat pane renders `messages`, the right pane renders `form`. */
  | { type: "snapshot"; form: DraftFormConfig; messages: ChatMessage[]; ready: boolean }
  | { type: "thinking" }
  | { type: "published"; formId: string; responderUrl: string; expiresAt: string }
  | { type: "error"; message: string };

export function parseAuthoringClientMessage(raw: string): AuthoringClientMessage | null {
  if (raw.length > 64 * 1024) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.type === "init") return { type: "init" };
  if (obj.type === "new_form") return { type: "new_form" };
  if (obj.type === "load_form" && typeof obj.formId === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(obj.formId)) {
    return { type: "load_form", formId: obj.formId };
  }
  if (obj.type === "publish") return { type: "publish" };
  if (obj.type === "user_message" && typeof obj.text === "string") {
    const text = obj.text.trim();
    return text && text.length <= 5000 ? { type: "user_message", text } : null;
  }
  return null;
}
