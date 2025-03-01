import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db';

// Get the directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('Starting database migration...');
  
  try {
    // Read the initial schema migration file
    const initialSchemaFile = path.join(path.dirname(__dirname), 'migrations', 'initial-schema.sql');
    const initialSchemaSql = fs.readFileSync(initialSchemaFile, 'utf8');
    
    // Execute the initial schema SQL
    await pool.query(initialSchemaSql);
    
    // Read the schema update migration file
    const updateSchemaFile = path.join(path.dirname(__dirname), 'migrations', 'update-schema.sql');
    
    // Check if the update file exists before attempting to read it
    if (fs.existsSync(updateSchemaFile)) {
      const updateSchemaSql = fs.readFileSync(updateSchemaFile, 'utf8');
      
      // Execute the schema update SQL
      await pool.query(updateSchemaSql);
      console.log('Schema update applied successfully!');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export default runMigration;