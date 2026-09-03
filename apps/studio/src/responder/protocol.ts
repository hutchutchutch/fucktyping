export interface ResponderMessage {
  type: "assistant";
  text: string;
  done: boolean;
}

export function parseResponderMessage(raw: unknown): ResponderMessage | null {
  if (typeof raw !== "string" || raw.length > 64 * 1024) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (
    data.type !== "assistant"
    || typeof data.text !== "string"
    || data.text.length > 10_000
    || typeof data.done !== "boolean"
  ) return null;
  return { type: "assistant", text: data.text, done: data.done };
}
