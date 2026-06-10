import { FormConfigSchema, type FormConfig, type Question } from "../forms/types";

/** A form being authored — same shape as FormConfig but tolerant of in-progress gaps
 *  (empty opening/closing, no questions yet). Becomes a FormConfig once publishable. */
export interface DraftQuestion {
  id: string;
  prompt: string;
  expectedResponseFormat: Question["expectedResponseFormat"];
  options?: string[];
  required: boolean;
  maxAttempts: number;
  validResponseExample?: string;
}

export interface DraftFormConfig {
  id: string;
  name: string;
  description?: string;
  openingActivity: { prompt: string };
  questions: DraftQuestion[];
  closingActivity: { prompt: string };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function emptyDraft(id: string): DraftFormConfig {
  return {
    id,
    name: "Untitled form",
    openingActivity: { prompt: "" },
    questions: [],
    closingActivity: { prompt: "" },
  };
}

/** Publishable = satisfies the strict runtime schema AND has at least one question. */
export function isPublishable(form: DraftFormConfig): boolean {
  if (form.questions.length === 0) return false;
  return FormConfigSchema.safeParse(form).success;
}

export function toPublished(form: DraftFormConfig): FormConfig {
  return FormConfigSchema.parse(form);
}
