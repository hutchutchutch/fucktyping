import { z } from 'zod';

// Schema for form data
export const FormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  ownerId: z.string().uuid(),
  isPublished: z.boolean().default(false),
  requiresAuth: z.boolean().default(false),
  enableVoice: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Form = z.infer<typeof FormSchema>;

// Schema for question data
export const QuestionTypeEnum = z.enum([
  'text',
  'multipleChoice',
  'rating',
  'yesNo',
  'email',
  'phone',
  'date'
]);

export type QuestionType = z.infer<typeof QuestionTypeEnum>;

export const QuestionSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  text: z.string().min(1, "Question text is required"),
  description: z.string().optional(),
  type: QuestionTypeEnum,
  isRequired: z.boolean().default(true),
  order: z.number().int().min(0),
  options: z.array(z.string()).optional(),
  validationRules: z.record(z.string(), z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Question = z.infer<typeof QuestionSchema>;

// Schema for response data
export const ResponseSchema = z.object({
  id: z.string().uuid(),
  formId: z.string().uuid(),
  respondentId: z.string().uuid().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Response = z.infer<typeof ResponseSchema>;

// Schema for answer data
export const AnswerSchema = z.object({
  id: z.string().uuid(),
  responseId: z.string().uuid(),
  questionId: z.string().uuid(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.date()
  ]),
  voiceTranscript: z.string().optional(),
  sentimentScore: z.number().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Answer = z.infer<typeof AnswerSchema>;

// Schema for user data
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof UserSchema>;

// Schema for LangGraph state
export const ConversationStateSchema = z.object({
  formId: z.string().uuid(),
  responseId: z.string().uuid(),
  currentQuestionIndex: z.number().int().min(0),
  questions: z.array(QuestionSchema),
  answers: z.record(z.string(), z.any()),
  transcripts: z.record(z.string(), z.string()),
  validationErrors: z.record(z.string(), z.string()),
  completed: z.boolean().default(false),
});

export type ConversationState = z.infer<typeof ConversationStateSchema>;