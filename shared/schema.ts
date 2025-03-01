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

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default('#6366F1'), // Default color for the category
  icon: text("icon"), // Icon name or identifier
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  userId: true,
  name: true,
  description: true,
  color: true,
  icon: true,
});

// Form schema
export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default('draft'), // 'draft', 'active', 'archived'
  isActive: boolean("is_active").default(true),
  collectEmail: boolean("collect_email").default(false),
  
  // Opening Activity
  openingMessage: text("opening_message"),
  voiceType: text("voice_type").default('neutral'), // 'male', 'female', 'neutral', 'custom'
  
  // Email Notification Settings
  emailNotificationEnabled: boolean("email_notification_enabled").default(false),
  emailRecipients: text("email_recipients"),
  emailSubject: text("email_subject"),
  emailTemplate: text("email_template"),
  
  // Closing Activity
  closingMessage: text("closing_message"),
  knowledgeBase: jsonb("knowledge_base"), // For storing document references/paths
  
  // Dynamic Variables
  dynamicVariables: jsonb("dynamic_variables"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFormSchema = createInsertSchema(forms).pick({
  userId: true,
  categoryId: true,
  title: true,
  description: true,
  status: true,
  isActive: true,
  collectEmail: true,
  
  // Opening Activity
  openingMessage: true,
  voiceType: true,
  
  // Email notification
  emailNotificationEnabled: true,
  emailRecipients: true,
  emailSubject: true,
  emailTemplate: true,
  
  // Closing Activity
  closingMessage: true,
  knowledgeBase: true,
  
  // Dynamic Variables
  dynamicVariables: true,
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
  description: text("description"), // Optional description/instructions for the question
  validation: jsonb("validation"), // For validation rules like min/max for ratings
  conversationRepair: jsonb("conversation_repair"), // For handling unclear responses
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  formId: true,
  text: true,
  type: true,
  order: true,
  options: true,
  required: true,
  description: true,
  validation: true,
  conversationRepair: true,
});

export const questionTypeEnum = z.enum(['multiple_choice', 'text', 'rating', 'date']);

// Response schema
export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  respondentName: text("respondent_name"),
  respondentEmail: text("respondent_email"),
  status: text("status").default('complete'), // 'complete', 'partial'
  starred: boolean("starred").default(false),
  sentiment: integer("sentiment"), // Sentiment score from -100 to 100
  ipAddress: text("ip_address"), // To track unique respondents
  device: text("device"), // Device information
  browser: text("browser"), // Browser information
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResponseSchema = createInsertSchema(responses).pick({
  formId: true,
  respondentName: true,
  respondentEmail: true,
  status: true,
  starred: true,
  sentiment: true,
  ipAddress: true,
  device: true,
  browser: true,
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

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

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
  category?: Category;
};

// Extended Category types
export type CategoryWithStats = Category & {
  forms: Form[];
  formCount: number;
  responseRate: number;
  completionRate: number;
  averageSentiment?: number;
};

// Response with answers
export type ResponseWithAnswers = Response & { answers: Answer[] };
