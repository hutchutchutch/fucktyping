import type { ChatMessage, DraftFormConfig } from "./draft";

/** WebSocket contract for the authoring session (creator's browser <-> DO). */
export type AuthoringClientMessage =
  | { type: "init" }
  | { type: "user_message"; text: string }
  | { type: "publish" };

export type AuthoringServerMessage =
  /** Full state — the chat pane renders `messages`, the right pane renders `form`. */
  | { type: "snapshot"; form: DraftFormConfig; messages: ChatMessage[]; ready: boolean }
  | { type: "thinking" }
  | { type: "published"; formId: string }
  | { type: "error"; message: string };

export function parseAuthoringClientMessage(raw: string): AuthoringClientMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.type === "init") return { type: "init" };
  if (obj.type === "publish") return { type: "publish" };
  if (obj.type === "user_message" && typeof obj.text === "string") {
    return { type: "user_message", text: obj.text };
  }
  return null;
}
