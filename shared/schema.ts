import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema - basic user model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  avatarUrl: true,
});

// Form status enum
export const formStatusEnum = z.enum(['draft', 'active', 'archived']);
export type FormStatus = z.infer<typeof formStatusEnum>;

// Form schema
export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default('draft'), // 'draft', 'active', 'archived'
  isActive: boolean("is_active").default(true),
  emailNotificationEnabled: boolean("email_notification_enabled").default(false),
  emailRecipients: text("email_recipients"),
  emailSubject: text("email_subject"),
  emailTemplate: text("email_template"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFormSchema = createInsertSchema(forms).pick({
  userId: true,
  title: true,
  description: true,
  status: true,
  isActive: true,
  emailNotificationEnabled: true,
  emailRecipients: true,
  emailSubject: true,
  emailTemplate: true,
});

// Question schema
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'multiple_choice', 'text', 'rating', 'date'
  order: integer("order").notNull(),
  options: jsonb("options"), // For multiple choice questions
  required: boolean("required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  formId: true,
  text: true,
  type: true,
  order: true,
  options: true,
  required: true,
});

export const questionTypeEnum = z.enum(['multiple_choice', 'text', 'rating', 'date']);

// Response schema
export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  respondentName: text("respondent_name"),
  respondentEmail: text("respondent_email"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  formId: true,
  respondentName: true,
  respondentEmail: true,
});

// Answer schema
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => responses.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  answerText: text("answer_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  responseId: true,
  questionId: true,
  answerText: true,
});

// Conversation schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => responses.id, { onDelete: "cascade" }),
  transcript: text("transcript"),
  state: jsonb("state"), // LangGraph state
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  responseId: true,
  transcript: true,
  state: true,
});

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'system', 'assistant', 'user'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Extended Form types 
export type FormWithQuestions = Form & { 
  questions: Question[]; 
  responseCount?: number;
};

// Response with answers
export type ResponseWithAnswers = Response & { answers: Answer[] };
