// Fix UI component relative imports
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UI_COMPONENTS_DIR = path.join(__dirname, 'apps/frontend/src/components/ui');
const IMPORT_PATTERN = /import\s+(\{[^}]+\}|\w+)\s+from\s+"\.\/components\/ui\/([^"]+)"/g;

// Get all TypeScript files in the UI components directory
const files = fs.readdirSync(UI_COMPONENTS_DIR)
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

console.log(`Found ${files.length} UI component files to process.`);

// Process each file to update imports
let fixedCount = 0;
for (const file of files) {
  const filePath = path.join(UI_COMPONENTS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.match(IMPORT_PATTERN)) {
    // Replace "./components/ui/xyz" with "./xyz"
    const updatedContent = content.replace(IMPORT_PATTERN, 'import $1 from "./$2"');
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    fixedCount++;
    console.log(`Updated relative imports in ${file}`);
  }
}

console.log(`Fixed relative imports in ${fixedCount} files.`);