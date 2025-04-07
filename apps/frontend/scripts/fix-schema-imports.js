// Fix schema imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Get current file directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all TypeScript and JavaScript files
const files = globSync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: path.resolve(__dirname, '..'),
  absolute: true,
});

console.log(`Checking ${files.length} files for schema imports...`);

// Define the search patterns and replacements
const replacements = [
  {
    pattern: /import.*from ['"]shared\/schema['"]/g,
    replacement: 'import * from "@shared/schema"'
  },
  {
    pattern: /import.*from ['"]@shared\/schema['"]/g,
    replacement: 'import * from "@shared/schema"'
  },
  {
    pattern: /import.*from ['"]\.\/components\/ui\/([^'"]+)['"]/g,
    replacement: 'import * from "@ui/$1"'
  }
];

let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let modified = false;

  // Apply each replacement to the file content
  replacements.forEach(({ pattern, replacement }) => {
    // Use a helper function to preserve the import specifics
    content = content.replace(pattern, (match) => {
      modified = true;
      // Extract the actual import names and apply to the replacement pattern
      const importMatch = match.match(/import\s+{([^}]+)}\s+from/);
      if (importMatch) {
        const imports = importMatch[1].trim();
        return replacement.replace('*', `{ ${imports} }`);
      }
      return replacement;
    });
  });

  // If the file was modified, write the changes back
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated: ${path.relative(path.resolve(__dirname, '..'), file)}`);
    modifiedFiles++;
  }
});

console.log(`Updated ${modifiedFiles} files with schema and UI imports.`);