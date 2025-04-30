#!/usr/bin/env node

/**
 * This script builds the frontend without type checking.
 * It's useful for testing the absolute import paths without fixing all the TypeScript errors.
 * Note: This is a TEMPORARY solution. In a production environment, you should fix the TypeScript errors.
 */

import { exec } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get directory name using ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Run vite build directly
console.log('Building without TypeScript validation...');
console.log('NOTE: This is for testing purpose only. Fix TypeScript errors before production deployment.');

exec('npx vite build', { cwd: rootDir }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error during build: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`Build stderr: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('Build completed.');
});