import type { ResponseFormat } from "./types";

/** Pure builders that turn a node edit into a precise natural-language instruction
 *  for the authoring DO's LLM. No local state mutation — every edit round-trips
 *  through the existing user_message channel and re-broadcasts a snapshot. */

/** Human phrasing for each response format, used inside instructions. */
const FORMAT_PHRASE: Record<ResponseFormat, string> = {
  text: "a free-text response",
  multiple_choice: "a multiple-choice response",
  yes_no: "a yes/no response",
  number: "a number response",
  date: "a date response",
  email: "an email response",
  phone: "a phone number response",
};

/** Editable fields surfaced by the question node editor. */
export interface QuestionEdit {
  prompt?: string;
  format?: ResponseFormat;
  required?: boolean;
  options?: string[];
}

/** Update a question's prompt text. */
export function editQuestionPrompt(questionId: string, prompt: string): string {
  return `Update question ${questionId}: change the prompt to "${prompt.trim()}".`;
}

/** Change a question's expected response format. */
export function editQuestionFormat(questionId: string, format: ResponseFormat): string {
  return `Update question ${questionId} to expect ${FORMAT_PHRASE[format]}.`;
}

/** Toggle whether a question is required. */
export function editQuestionRequired(questionId: string, required: boolean): string {
  return required
    ? `Update question ${questionId} to be required.`
    : `Update question ${questionId} to be optional.`;
}

/** Replace the choice options for a question. */
export function editQuestionOptions(questionId: string, options: string[]): string {
  const cleaned = options.map((o) => o.trim()).filter((o) => o.length > 0);
  return `Update question ${questionId}: set the answer options to ${cleaned
    .map((o) => `"${o}"`)
    .join(", ")}.`;
}

/** Remove a question entirely. */
export function removeQuestion(questionId: string): string {
  return `Remove question ${questionId}.`;
}

/** Set the opening message. */
export function editOpening(prompt: string): string {
  return `Set the opening message to "${prompt.trim()}".`;
}

/** Set the closing message. */
export function editClosing(prompt: string): string {
  return `Set the closing message to "${prompt.trim()}".`;
}

/** Build a single combined instruction for a batch of question changes. Only fields
 *  present in `changes` are included; returns an empty array when nothing changed. */
export function buildQuestionEdits(questionId: string, changes: QuestionEdit): string[] {
  const out: string[] = [];
  if (changes.prompt !== undefined) out.push(editQuestionPrompt(questionId, changes.prompt));
  if (changes.format !== undefined) out.push(editQuestionFormat(questionId, changes.format));
  if (changes.required !== undefined) out.push(editQuestionRequired(questionId, changes.required));
  if (changes.options !== undefined) out.push(editQuestionOptions(questionId, changes.options));
  return out;
}
