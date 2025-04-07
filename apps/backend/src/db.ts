import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "database";

// Parse database URL from environment
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Configure postgres client
const client = postgres(process.env.DATABASE_URL, {
  max: 10, // Max number of connections in the pool
});

// Initialize Drizzle ORM with our schema
export const db = drizzle(client, { schema });

// Export the pg client for direct SQL queries if needed
export const pgClient = client;