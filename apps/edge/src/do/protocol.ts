/** WebSocket message contract between the voice pipeline (do_client.py) and the DO. */

export type ClientMessage =
  | { type: "start" }
  | { type: "user_answer"; text: string };

export interface ServerMessage {
  type: "assistant";
  text: string;
  done: boolean;
}

export function parseClientMessage(raw: string): ClientMessage | null {
  if (raw.length > 64 * 1024) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.type === "start") {
    // Route authorization establishes form identity. Ignore the legacy form_id field
    // so a client message can never switch an authorized socket to another form.
    return { type: "start" };
  }
  if (obj.type === "user_answer" && typeof obj.text === "string") {
    const text = obj.text.trim();
    return text && text.length <= 5000 ? { type: "user_answer", text } : null;
  }
  return null;
}
