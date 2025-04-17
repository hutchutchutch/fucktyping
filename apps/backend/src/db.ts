import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "shared/schemas";
import 'dotenv/config';

// Define database connection based on environment variables
const getDbConnectionString = () => {
  // For AWS RDS connection
  if (process.env.NODE_ENV === 'production') {
    const {
      RDS_HOSTNAME,
      RDS_PORT,
      RDS_DB_NAME,
      RDS_USERNAME,
      RDS_PASSWORD
    } = process.env;
    
    if (!RDS_HOSTNAME || !RDS_PORT || !RDS_DB_NAME || !RDS_USERNAME || !RDS_PASSWORD) {
      throw new Error("Missing RDS environment variables");
    }
    
    return `postgres://${RDS_USERNAME}:${RDS_PASSWORD}@${RDS_HOSTNAME}:${RDS_PORT}/${RDS_DB_NAME}`;
  }
  
  // For local or specified database URL
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // For container-based database with individual environment variables
  const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD
  } = process.env;
  
  if (DATABASE_HOST && DATABASE_PORT && DATABASE_NAME && DATABASE_USER && DATABASE_PASSWORD) {
    return `postgres://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;
  }
  
  throw new Error("Database connection information not provided. Set DATABASE_URL or individual DB environment variables.");
};

// Create connection
const connectionString = getDbConnectionString();
console.log(`Connecting to database at ${connectionString.replace(/:[^:]*@/, ':****@')}`);

// Set up database client with connection pooling suitable for serverless environments
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max seconds a client can be idle before being removed
  connect_timeout: 10, // Max seconds to wait for connection
  prepare: false, // Don't use prepared statements in serverless environments
});

// Export the drizzle ORM instance
export const db = drizzle(client, { schema });