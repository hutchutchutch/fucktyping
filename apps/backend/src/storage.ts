import { db } from "./db";
import { sql } from "drizzle-orm";

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