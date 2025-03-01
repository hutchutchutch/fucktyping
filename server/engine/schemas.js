// schemas.js
import { z } from "zod";

// Schema for OpenActivity node configuration
export const OpenActivitySchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  backgroundInfo: z.string().optional(),
  useDirectPrompt: z.boolean().default(true),
  voiceSettings: z.object({
    type: z.enum(["male", "female", "neutral"]),
    speed: z.number().min(0.5).max(2.0).default(1.0),
    pitch: z.number().min(0.5).max(2.0).default(1.0)
  }).optional()
});

// Schema for Question node configuration
export const QuestionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(1, "Question prompt is required"),
  backgroundInfo: z.string().optional(),
  expectedResponseFormat: z.enum([
    "text", 
    "multiple_choice", 
    "yes_no", 
    "number", 
    "date", 
    "email", 
    "phone"
  ]),
  useDirectPrompt: z.boolean().default(true),
  validResponseExample: z.string().optional(),
  invalidResponseExample: z.string().optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  rephrasePrompt: z.string().optional(),
  maxAttempts: z.number().int().min(1).max(5).default(3),
  createDynamicReference: z.boolean().default(false),
  referenceName: z.string().optional(),
  order: z.number().int().min(0)
});

// Schema for ClosingActivity node configuration
export const ClosingActivitySchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  backgroundInfo: z.string().optional(),
  useDirectPrompt: z.boolean().default(true),
  knowledgeBaseId: z.string().optional(),
  collectFeedback: z.boolean().default(false),
  followUpEmailTemplate: z.string().optional()
});

// Schema for the entire form configuration
export const FormConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  openingActivity: OpenActivitySchema,
  questions: z.array(QuestionSchema),
  closingActivity: ClosingActivitySchema,
  collectEmail: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Schema for conversation state
export const ConversationStateSchema = z.object({
  formId: z.string(),
  conversationId: z.string(),
  currentNodeId: z.string(),
  currentQuestionIndex: z.number().int().default(0),
  responses: z.record(z.string(), z.any()).default({}),
  dynamicReferences: z.record(z.string(), z.string()).default({}),
  messages: z.array(z.object({
    role: z.enum(["system", "assistant", "user"]),
    content: z.string()
  })).default([]),
  currentAttempts: z.number().int().default(0),
  isComplete: z.boolean().default(false),
  requiresFollowUp: z.boolean().default(false),
  userInfo: z.object({
    email: z.string().email().optional()
  }).optional()
});

// Type definitions - using JSDoc for documentation since this is JavaScript
/**
 * @typedef {import('zod').infer<typeof OpenActivitySchema>} OpenActivity
 * @typedef {import('zod').infer<typeof QuestionSchema>} Question
 * @typedef {import('zod').infer<typeof ClosingActivitySchema>} ClosingActivity
 * @typedef {import('zod').infer<typeof FormConfigSchema>} FormConfig
 * @typedef {import('zod').infer<typeof ConversationStateSchema>} ConversationState
 */