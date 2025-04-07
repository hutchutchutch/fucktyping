import {
  users, categories, forms, questions, responses, answers, conversations, messages,
  type User, type InsertUser, type Category, type InsertCategory, 
  type Form, type InsertForm, type Question, type InsertQuestion, 
  type Response, type InsertResponse, type Answer, type InsertAnswer, 
  type Conversation, type InsertConversation, type Message, type InsertMessage,
  type FormWithQuestions, type ResponseWithAnswers, type CategoryWithStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getCategoryWithStats(id: number): Promise<CategoryWithStats | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    if (!category) return undefined;
    
    const categoryForms = await this.getFormsByCategoryId(id);
    
    // Calculate stats
    const formCount = categoryForms.length;
    let responseCount = 0;
    let completedResponseCount = 0;
    
    for (const form of categoryForms) {
      const formResponses = await this.getResponsesByFormId(form.id);
      responseCount += formResponses.length;
      completedResponseCount += formResponses.filter(r => r.completedAt !== null).length;
    }
    
    const responseRate = formCount > 0 ? responseCount / formCount : 0;
    const completionRate = responseCount > 0 ? completedResponseCount / responseCount : 0;
    
    return {
      ...category,
      forms: categoryForms,
      formCount,
      responseRate,
      completionRate,
      averageSentiment: 0.75, // Mock value for sentiment analysis
    };
  }

  async getAllCategoriesWithStats(userId: number): Promise<CategoryWithStats[]> {
    const userCategories = await this.getCategoriesByUserId(userId);
    const result: CategoryWithStats[] = [];
    
    for (const category of userCategories) {
      const categoryWithStats = await this.getCategoryWithStats(category.id);
      if (categoryWithStats) {
        result.push(categoryWithStats);
      }
    }
    
    return result;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(categoryUpdate)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // First, update all forms in this category to have no category
    const categoryForms = await this.getFormsByCategoryId(id);
    for (const form of categoryForms) {
      await this.updateForm(form.id, { categoryId: null });
    }
    
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
      
    return result.length > 0;
  }

  // Form operations
  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async getFormWithQuestions(id: number): Promise<FormWithQuestions | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    if (!form) return undefined;
    
    const formQuestions = await this.getQuestionsByFormId(id);
    return {
      ...form,
      questions: formQuestions
    };
  }

  async getFormsByUserId(userId: number): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.userId, userId));
  }

  async getFormsByCategoryId(categoryId: number): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.categoryId, categoryId));
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db
      .insert(forms)
      .values(insertForm)
      .returning();
    return form;
  }

  async updateForm(id: number, formUpdate: Partial<InsertForm>): Promise<Form | undefined> {
    const [updatedForm] = await db
      .update(forms)
      .set({
        ...formUpdate,
        updatedAt: new Date()
      })
      .where(eq(forms.id, id))
      .returning();
    return updatedForm;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db
      .delete(forms)
      .where(eq(forms.id, id))
      .returning();
      
    return result.length > 0;
  }

  // Question operations
  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async getQuestionsByFormId(formId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.formId, formId))
      .orderBy(asc(questions.order));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async updateQuestion(id: number, questionUpdate: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updatedQuestion] = await db
      .update(questions)
      .set(questionUpdate)
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const result = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning();
      
    return result.length > 0;
  }

  // Response operations
  async getResponse(id: number): Promise<Response | undefined> {
    const [response] = await db.select().from(responses).where(eq(responses.id, id));
    return response;
  }

  async getResponseWithAnswers(id: number): Promise<ResponseWithAnswers | undefined> {
    const [response] = await db.select().from(responses).where(eq(responses.id, id));
    if (!response) return undefined;
    
    const responseAnswers = await this.getAnswersByResponseId(id);
    return {
      ...response,
      answers: responseAnswers
    };
  }

  async getResponsesByFormId(formId: number): Promise<Response[]> {
    return await db
      .select()
      .from(responses)
      .where(eq(responses.formId, formId))
      .orderBy(desc(responses.createdAt));
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db
      .insert(responses)
      .values(insertResponse)
      .returning();
    return response;
  }

  // Answer operations
  async getAnswer(id: number): Promise<Answer | undefined> {
    const [answer] = await db.select().from(answers).where(eq(answers.id, id));
    return answer;
  }

  async getAnswersByResponseId(responseId: number): Promise<Answer[]> {
    return await db
      .select()
      .from(answers)
      .where(eq(answers.responseId, responseId));
  }

  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const [answer] = await db
      .insert(answers)
      .values(insertAnswer)
      .returning();
    return answer;
  }

  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationByResponseId(responseId: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.responseId, responseId));
    return conversation;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, conversationUpdate: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [updatedConversation] = await db
      .update(conversations)
      .set({
        ...conversationUpdate,
        updatedAt: new Date()
      })
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.timestamp));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Seed test data for development
  async seedTestData() {
    // Create test user
    let user: User;
    const existingUser = await this.getUserByUsername("testuser");
    
    if (existingUser) {
      user = existingUser;
    } else {
      user = await this.createUser({
        username: "testuser",
        password: "password123",
        displayName: "Sarah Wilson",
        email: "sarah@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      });
    }
    
    // Check if categories already exist for this user to avoid duplicates
    const existingCategories = await this.getCategoriesByUserId(user.id);
    if (existingCategories.length > 0) {
      console.log("Test data already exists. Skipping seed process.");
      return;
    }
    
    // Create categories
    const customerCategory = await this.createCategory({
      userId: user.id,
      name: "Customer Feedback",
      description: "Forms for gathering customer input and feedback",
      color: "#3B82F6",
      icon: "star"
    });
    
    const hrCategory = await this.createCategory({
      userId: user.id,
      name: "Human Resources",
      description: "Forms related to HR processes and recruiting",
      color: "#8B5CF6",
      icon: "users"
    });
    
    const eventCategory = await this.createCategory({
      userId: user.id,
      name: "Events",
      description: "Forms for event planning, feedback, and management",
      color: "#EC4899",
      icon: "calendar"
    });
    
    const marketingCategory = await this.createCategory({
      userId: user.id,
      name: "Marketing",
      description: "Forms for marketing surveys and campaigns",
      color: "#10B981",
      icon: "megaphone"
    });
    
    // Create a few forms
    const form1 = await this.createForm({
      userId: user.id,
      categoryId: customerCategory.id,
      title: "Customer Satisfaction",
      description: "Please provide feedback about your recent experience with our customer service team.",
      status: "active",
      isActive: true,
      emailNotificationEnabled: true,
      emailRecipients: "admin@example.com, manager@example.com",
      emailSubject: "New Customer Feedback Submission",
      emailTemplate: `Hi there,

A new customer feedback form has been submitted.

Form: {{formName}}
Respondent: {{respondentName}} ({{respondentEmail}})
Date: {{submissionDate}}

View the full response: {{responseLink}}

Thanks,
Voice Form Agent`
    });
    
    // Add questions to form1
    await this.createQuestion({
      formId: form1.id,
      text: "How would you rate your overall experience?",
      type: "multiple_choice",
      order: 1,
      options: ["Excellent", "Good", "Average", "Poor"],
      required: true
    });
    
    await this.createQuestion({
      formId: form1.id,
      text: "What aspects of our service could be improved?",
      type: "text",
      order: 2,
      options: null,
      required: true
    });
    
    // Create another form in the same category
    const form2 = await this.createForm({
      userId: user.id,
      categoryId: customerCategory.id,
      title: "Product Feedback",
      description: "Help us improve our products with your feedback",
      status: "active",
      isActive: true,
      emailNotificationEnabled: true,
      emailRecipients: "product@example.com",
      emailSubject: "New Product Feedback",
      emailTemplate: null
    });
    
    // Add questions to form2
    await this.createQuestion({
      formId: form2.id,
      text: "Which product are you providing feedback for?",
      type: "multiple_choice",
      order: 1,
      options: ["Product A", "Product B", "Product C", "Other"],
      required: true
    });
    
    await this.createQuestion({
      formId: form2.id,
      text: "How would you rate this product?",
      type: "rating",
      order: 2,
      options: null,
      required: true
    });
    
    await this.createQuestion({
      formId: form2.id,
      text: "What do you like most about this product?",
      type: "text",
      order: 3,
      options: null,
      required: false
    });
    
    // Create an HR form
    const form3 = await this.createForm({
      userId: user.id,
      categoryId: hrCategory.id,
      title: "Job Application",
      description: "Apply for open positions in our company",
      status: "active",
      isActive: true,
      emailNotificationEnabled: true,
      emailRecipients: "hr@example.com, recruiting@example.com",
      emailSubject: "New Job Application",
      emailTemplate: null
    });
    
    // Create a few questions for the Job Application form
    await this.createQuestion({
      formId: form3.id,
      text: "Which position are you applying for?",
      type: "multiple_choice",
      order: 1,
      options: ["Software Engineer", "UX Designer", "Product Manager", "Sales Representative", "Other"],
      required: true
    });
    
    await this.createQuestion({
      formId: form3.id,
      text: "Do you have previous experience in this role?",
      type: "multiple_choice",
      order: 2,
      options: ["Yes", "No"],
      required: true
    });
    
    await this.createQuestion({
      formId: form3.id,
      text: "Briefly describe your relevant experience",
      type: "text",
      order: 3,
      options: null,
      required: true
    });
    
    // Create an event form
    const form4 = await this.createForm({
      userId: user.id,
      categoryId: eventCategory.id,
      title: "Conference Registration",
      description: "Register for our upcoming industry conference",
      status: "active",
      isActive: true,
      emailNotificationEnabled: true,
      emailRecipients: "events@example.com",
      emailSubject: "New Conference Registration",
      emailTemplate: null
    });
    
    // Add questions to event form
    await this.createQuestion({
      formId: form4.id,
      text: "Which tracks are you interested in attending?",
      type: "multiple_choice",
      order: 1,
      options: ["Technology", "Design", "Business", "Marketing"],
      required: true
    });
    
    await this.createQuestion({
      formId: form4.id,
      text: "Do you have any dietary restrictions?",
      type: "text",
      order: 2,
      options: null,
      required: false
    });
    
    console.log("Test data seeded successfully");
  }
}