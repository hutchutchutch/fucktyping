import { z } from "zod";

/** The contract collected from creators; mirrors the legacy engine/schemas.js subset
 *  the runtime actually needs to drive a conversation. */
export const QuestionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(1),
  expectedResponseFormat: z.enum([
    "text",
    "multiple_choice",
    "yes_no",
    "number",
    "date",
    "email",
    "phone",
  ]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).max(5).default(3),
  validResponseExample: z.string().optional(),
  invalidResponseExample: z.string().optional(),
  rephrasePrompt: z.string().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const FormConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  openingActivity: z.object({ prompt: z.string().min(1) }),
  questions: z.array(QuestionSchema),
  closingActivity: z.object({ prompt: z.string().min(1) }),
});
export type FormConfig = z.infer<typeof FormConfigSchema>;

/** Runtime conversation state held in the Durable Object (persisted across hibernation). */
export interface ConversationState {
  formId: string;
  phase: "opening" | "asking" | "done";
  currentQuestionIndex: number;
  currentAttempts: number;
  responses: Record<string, unknown>;
}
