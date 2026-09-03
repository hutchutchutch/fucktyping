import type { ChatMessage } from "./draft";

export const MAX_AUTHORING_MESSAGES = 40;
export const MAX_AUTHORING_HISTORY_CHARS = 40_000;

export function appendBoundedMessage(
  messages: ChatMessage[],
  message: ChatMessage,
  limit = MAX_AUTHORING_MESSAGES,
  characterLimit = MAX_AUTHORING_HISTORY_CHARS,
): void {
  messages.push(message);
  const overflow = messages.length - limit;
  if (overflow > 0) messages.splice(0, overflow);
  let characters = messages.reduce((total, item) => total + item.content.length, 0);
  while (messages.length > 1 && characters > characterLimit) {
    characters -= messages.shift()?.content.length ?? 0;
  }
}
