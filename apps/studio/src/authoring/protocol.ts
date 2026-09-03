import type { AuthoringServerMessage, ChatMessage, DraftFormConfig, DraftQuestion, ResponseFormat } from "./types";

/** Client → DO message builders. */
export const initMsg = (): string => JSON.stringify({ type: "init" });
export const newFormMsg = (): string => JSON.stringify({ type: "new_form" });
export const loadFormMsg = (formId: string): string => JSON.stringify({ type: "load_form", formId });
export const userMsg = (text: string): string => JSON.stringify({ type: "user_message", text });
export const publishMsg = (): string => JSON.stringify({ type: "publish" });

export function websocketProtocols(token: string): string[] {
  return ["fucktyping", `fucktyping-auth.${token}`];
}

/** Defensive parse of a DO → client message (no zod; trust-but-verify the shapes). */
export function parseServerMessage(raw: unknown): AuthoringServerMessage | null {
  if (typeof raw !== "string" || raw.length > 256 * 1024) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  const data = record(value);
  if (!data) return null;

  switch (data.type) {
    case "snapshot": {
      const form = parseDraftForm(data.form);
      const messages = parseMessages(data.messages);
      return form && messages && typeof data.ready === "boolean"
        ? { type: "snapshot", form, messages, ready: data.ready }
        : null;
    }
    case "thinking":
      return { type: "thinking" };
    case "published":
      return typeof data.formId === "string"
        && typeof data.responderUrl === "string"
        && typeof data.expiresAt === "string"
        ? {
            type: "published",
            formId: data.formId,
            responderUrl: data.responderUrl,
            expiresAt: data.expiresAt,
          }
        : null;
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

const RESPONSE_FORMATS = new Set<ResponseFormat>([
  "text", "multiple_choice", "yes_no", "number", "date", "email", "phone",
]);

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function parseQuestion(value: unknown): DraftQuestion | null {
  const question = record(value);
  if (
    !question
    || typeof question.id !== "string"
    || typeof question.prompt !== "string"
    || typeof question.expectedResponseFormat !== "string"
    || !RESPONSE_FORMATS.has(question.expectedResponseFormat as ResponseFormat)
    || typeof question.required !== "boolean"
    || typeof question.maxAttempts !== "number"
  ) return null;
  const options = question.options === undefined
    ? undefined
    : Array.isArray(question.options) && question.options.every((option) => typeof option === "string")
      ? question.options
      : null;
  if (options === null) return null;
  return {
    id: question.id,
    prompt: question.prompt,
    expectedResponseFormat: question.expectedResponseFormat as ResponseFormat,
    options,
    required: question.required,
    maxAttempts: question.maxAttempts,
    validResponseExample: typeof question.validResponseExample === "string"
      ? question.validResponseExample
      : undefined,
    invalidResponseExample: typeof question.invalidResponseExample === "string"
      ? question.invalidResponseExample
      : undefined,
    rephrasePrompt: typeof question.rephrasePrompt === "string"
      ? question.rephrasePrompt
      : undefined,
  };
}

function parseDraftForm(value: unknown): DraftFormConfig | null {
  const form = record(value);
  const opening = record(form?.openingActivity);
  const closing = record(form?.closingActivity);
  if (
    !form
    || typeof form.id !== "string"
    || typeof form.name !== "string"
    || (form.description !== undefined && typeof form.description !== "string")
    || typeof opening?.prompt !== "string"
    || typeof closing?.prompt !== "string"
    || !Array.isArray(form.questions)
  ) return null;
  const questions = form.questions.map(parseQuestion);
  if (questions.some((question) => question === null)) return null;
  return {
    id: form.id,
    name: form.name,
    description: form.description,
    openingActivity: { prompt: opening.prompt },
    questions: questions as DraftQuestion[],
    closingActivity: { prompt: closing.prompt },
  };
}

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value)) return null;
  const messages: ChatMessage[] = [];
  for (const item of value) {
    const message = record(item);
    if (
      !message
      || (message.role !== "user" && message.role !== "assistant")
      || typeof message.content !== "string"
    ) return null;
    messages.push({ role: message.role, content: message.content });
  }
  return messages;
}
