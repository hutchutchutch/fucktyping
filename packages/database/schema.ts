import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
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
  answerValue: integer("answer_value"), // For numerical responses like ratings
  originalTranscript: text("original_transcript"), // For voice responses, the raw transcript
  confidence: integer("confidence"), // Confidence score for voice processing (0-100)
  audioUrl: text("audio_url"), // URL to stored audio response
  processingDetails: jsonb("processing_details"), // Additional processing metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  responseId: true,
  questionId: true,
  answerText: true,
  answerValue: true,
  originalTranscript: true,
  confidence: true, 
  audioUrl: true,
  processingDetails: true,
});

// Conversation schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => responses.id, { onDelete: "cascade" }),
  formId: integer("form_id").references(() => forms.id), // Direct reference to form for easier querying
  transcript: text("transcript"),
  state: jsonb("state"), // LangGraph state
  aiSettings: jsonb("ai_settings"), // AI model settings (temperature, etc)
  agentPersona: text("agent_persona"), // Persona used for the conversation
  duration: integer("duration"), // Conversation duration in seconds
  interactionCount: integer("interaction_count"), // Number of back-and-forth exchanges
  metadata: jsonb("metadata"), // Additional metadata about the conversation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  responseId: true,
  formId: true,
  transcript: true,
  state: true,
  aiSettings: true,
  agentPersona: true,
  duration: true,
  interactionCount: true,
  metadata: true,
});

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  questionId: integer("question_id").references(() => questions.id), // Related question (if applicable)
  role: text("role").notNull(), // 'system', 'assistant', 'user'
  content: text("content").notNull(),
  originalAudio: text("original_audio"), // URL to audio if it was a voice message
  processedContent: text("processed_content"), // Content after any AI processing
  sentiment: integer("sentiment"), // Sentiment score for this message
  tokens: integer("tokens"), // Token count for this message
  metadata: jsonb("metadata"), // Additional metadata about this message
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  questionId: true,
  role: true,
  content: true,
  originalAudio: true,
  processedContent: true,
  sentiment: true,
  tokens: true,
  metadata: true,
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
export type ResponseWithAnswers = Response & { 
  answers: Answer[];
  form?: Form;
};

// Enhanced message type with related entities
export type MessageWithRelations = Message & {
  question?: Question;
  conversation: Conversation;
};

// Conversation with messages and response
export type ConversationWithMessages = Conversation & {
  messages: Message[];
  response: Response;
  form?: Form;
};

// Form analytics
export type FormAnalytics = {
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number; // in seconds
  sentimentScore: number; 
  questionBreakdown: QuestionAnalytics[];
};

// Question analytics
export type QuestionAnalytics = {
  questionId: number;
  questionText: string;
  responseRate: number; // percentage of form responses that answered this question
  averageTimeSpent: number; // in seconds
  commonAnswers?: string[];
  sentimentScore?: number;
};

// Voice metrics
export type VoiceMetrics = {
  totalAudioDuration: number; // in seconds
  averageTranscriptionConfidence: number;
  totalVoiceResponses: number;
  percentageOfVoiceResponses: number;
};

// Voice Agent tables

// Voice agent config types
export const voiceAgentNodeTypeEnum = z.enum([
  'opening_activity',
  'question',
  'validation',
  'rephrase',
  'closing_activity',
  'process_input'
]);
export type VoiceAgentNodeType = z.infer<typeof voiceAgentNodeTypeEnum>;

// Voice Agent schema - represents a voice agent for a form
export const voiceAgents = pgTable("voice_agents", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  aiModel: varchar("ai_model", { length: 100 }).default("llama3-70b-8192"), // Default language model
  temperature: integer("temperature").default(70), // Temperature * 100 (0.7 = 70)
  systemPrompt: text("system_prompt"),
  maxTokens: integer("max_tokens").default(1024),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata"), // Additional metadata about the voice agent
});

export const insertVoiceAgentSchema = createInsertSchema(voiceAgents).pick({
  formId: true,
  name: true,
  description: true,
  isActive: true,
  aiModel: true,
  temperature: true,
  systemPrompt: true,
  maxTokens: true,
  metadata: true,
});

// Voice Agent Node schema - represents a node in the voice agent graph
export const voiceAgentNodes = pgTable("voice_agent_nodes", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => voiceAgents.id, { onDelete: "cascade" }),
  nodeType: varchar("node_type", { length: 50 }).notNull(), // 'opening_activity', 'question', 'validation', etc.
  nodeId: varchar("node_id", { length: 100 }).notNull(), // Unique ID for this node in the graph
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  prompt: text("prompt"), // Prompt template for this node
  order: integer("order").default(0), // Order for sequencing
  configuration: jsonb("configuration"), // Additional configuration for this node
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVoiceAgentNodeSchema = createInsertSchema(voiceAgentNodes).pick({
  agentId: true,
  nodeType: true,
  nodeId: true,
  name: true,
  description: true,
  prompt: true,
  order: true,
  configuration: true,
});

// Voice Agent Edge schema - represents an edge in the voice agent graph
export const voiceAgentEdges = pgTable("voice_agent_edges", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => voiceAgents.id, { onDelete: "cascade" }),
  fromNodeId: varchar("from_node_id", { length: 100 }).notNull(),
  toNodeId: varchar("to_node_id", { length: 100 }).notNull(),
  condition: jsonb("condition"), // Conditional logic for this edge
  isDefault: boolean("is_default").default(false), // Whether this is the default edge
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVoiceAgentEdgeSchema = createInsertSchema(voiceAgentEdges).pick({
  agentId: true,
  fromNodeId: true,
  toNodeId: true,
  condition: true,
  isDefault: true,
});

// Voice Agent Session schema - represents a running session of a voice agent
export const voiceAgentSessions = pgTable("voice_agent_sessions", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => voiceAgents.id, { onDelete: "cascade" }),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
  sessionState: jsonb("session_state").notNull(), // Current state of the session
  currentNodeId: varchar("current_node_id", { length: 100 }).notNull(), // Current node in the graph
  isComplete: boolean("is_complete").default(false),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"), // Additional metadata about the session
});

export const insertVoiceAgentSessionSchema = createInsertSchema(voiceAgentSessions).pick({
  agentId: true,
  conversationId: true,
  sessionState: true,
  currentNodeId: true,
  isComplete: true,
  metadata: true,
});

// Types for voice agent entities
export type VoiceAgent = typeof voiceAgents.$inferSelect;
export type InsertVoiceAgent = z.infer<typeof insertVoiceAgentSchema>;

export type VoiceAgentNode = typeof voiceAgentNodes.$inferSelect;
export type InsertVoiceAgentNode = z.infer<typeof insertVoiceAgentNodeSchema>;

export type VoiceAgentEdge = typeof voiceAgentEdges.$inferSelect;
export type InsertVoiceAgentEdge = z.infer<typeof insertVoiceAgentEdgeSchema>;

export type VoiceAgentSession = typeof voiceAgentSessions.$inferSelect;
export type InsertVoiceAgentSession = z.infer<typeof insertVoiceAgentSessionSchema>;

// Extended Voice Agent types
export type VoiceAgentWithNodes = VoiceAgent & { 
  nodes: VoiceAgentNode[];
  edges: VoiceAgentEdge[];
  form?: Form;
};