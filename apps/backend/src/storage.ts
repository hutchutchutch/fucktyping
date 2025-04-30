import { db } from "./db";
import { sql } from "drizzle-orm";
import { DatabaseStorage } from "./databaseStorage";

/**
 * Storage interface for the application
 * Defines operations for working with forms, questions, responses, etc.
 */
export interface IStorage {
  // Form operations
  getForm(id: number): Promise<any | undefined>;
  getFormWithQuestions(id: number): Promise<any | undefined>;
  getFormsByUserId(userId: number): Promise<any[]>;
  getFormsByCategoryId(categoryId: number): Promise<any[]>;
  createForm(insertForm: any): Promise<any>;
  updateForm(id: number, formUpdate: Partial<any>): Promise<any | undefined>;
  deleteForm(id: number): Promise<boolean>;
  
  // Question operations
  getQuestion(id: number): Promise<any | undefined>;
  getQuestionsByFormId(formId: number): Promise<any[]>;
  createQuestion(insertQuestion: any): Promise<any>;
  updateQuestion(id: number, questionUpdate: Partial<any>): Promise<any | undefined>;
  deleteQuestion(id: number): Promise<boolean>;
  
  // Response operations
  getResponse(id: number): Promise<any | undefined>;
  getResponseWithAnswers(id: number): Promise<any | undefined>;
  getResponsesByFormId(formId: number): Promise<any[]>;
  createResponse(insertResponse: any): Promise<any>;
  
  // Answer operations
  getAnswer(id: number): Promise<any | undefined>;
  getAnswersByResponseId(responseId: number): Promise<any[]>;
  createAnswer(insertAnswer: any): Promise<any>;
  
  // And others as needed...
}

// Singleton instance of the database storage
export const storage: IStorage = new DatabaseStorage();

/**
 * Initialize the storage system
 * This function should be called when the application starts
 */
export async function initializeStorage() {
  try {
    // Test database connection
    await db.execute(sql`SELECT NOW()`);
    console.log("Database connection successful");
    
    return true;
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw error;
  }
}