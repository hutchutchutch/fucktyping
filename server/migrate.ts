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
    // Read the migration file
    const migrationFile = path.join(path.dirname(__dirname), 'migrations', 'initial-schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export default runMigration;