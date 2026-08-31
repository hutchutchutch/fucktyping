import { z } from "zod";

/** The contract collected from creators; mirrors the legacy engine/schemas.js subset
 *  the runtime actually needs to drive a conversation. */
export const QuestionSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
  prompt: z.string().trim().min(1).max(2000),
  expectedResponseFormat: z.enum([
    "text",
    "multiple_choice",
    "yes_no",
    "number",
    "date",
    "email",
    "phone",
  ]),
  options: z.array(z.string().trim().min(1).max(500)).max(50).optional(),
  required: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).max(5).default(3),
  validResponseExample: z.string().max(1000).optional(),
  invalidResponseExample: z.string().max(1000).optional(),
  rephrasePrompt: z.string().max(2000).optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const FormConfigSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
  name: z.string().trim().min(1).max(200),
  openingActivity: z.object({ prompt: z.string().trim().min(1).max(2000) }),
  questions: z.array(QuestionSchema).min(1).max(50),
  closingActivity: z.object({ prompt: z.string().trim().min(1).max(2000) }),
}).superRefine((form, ctx) => {
  const seen = new Set<string>();
  form.questions.forEach((question, index) => {
    if (seen.has(question.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["questions", index, "id"], message: "question ids must be unique" });
    }
    seen.add(question.id);
  });
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
