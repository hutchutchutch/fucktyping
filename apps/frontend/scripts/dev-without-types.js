#!/usr/bin/env node

/**
 * This script runs the development server without type checking.
 * It's useful for testing the absolute import paths without fixing all the TypeScript errors.
 * Note: This is a TEMPORARY solution. In a production environment, you should fix the TypeScript errors.
 */

import { exec } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get directory name using ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Run vite dev directly
console.log('Starting development server without TypeScript validation...');
console.log('NOTE: This is for testing purpose only. Fix TypeScript errors before production deployment.');

// Execute vite without type checking
const devProcess = exec('npx vite', { cwd: rootDir });

// Forward stdio
devProcess.stdout.pipe(process.stdout);
devProcess.stderr.pipe(process.stderr);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  devProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down development server...');
  devProcess.kill('SIGTERM');
  process.exit(0);
});