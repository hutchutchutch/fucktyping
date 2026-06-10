/** WebSocket message contract between the voice pipeline (do_client.py) and the DO. */

export type ClientMessage =
  | { type: "start"; form_id?: string }
  | { type: "user_answer"; text: string };

export interface ServerMessage {
  type: "assistant";
  text: string;
  done: boolean;
}

export function parseClientMessage(raw: string): ClientMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.type === "start") {
    return { type: "start", form_id: typeof obj.form_id === "string" ? obj.form_id : undefined };
  }
  if (obj.type === "user_answer" && typeof obj.text === "string") {
    return { type: "user_answer", text: obj.text };
  }
  return null;
}
