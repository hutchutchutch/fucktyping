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

// Other schemas omitted for brevity...