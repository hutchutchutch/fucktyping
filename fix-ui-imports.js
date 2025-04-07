// Fix UI component imports
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UI_COMPONENTS_DIR = path.join(__dirname, 'apps/frontend/src/components/ui');
const OLD_IMPORT = 'from "./lib/utils"';
const NEW_IMPORT = 'from "../../lib/utils"';

// Get all TypeScript files in the UI components directory
const files = fs.readdirSync(UI_COMPONENTS_DIR)
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

console.log(`Found ${files.length} UI component files to process.`);

// Process each file to update imports
let fixedCount = 0;
for (const file of files) {
  const filePath = path.join(UI_COMPONENTS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(OLD_IMPORT)) {
    content = content.replace(OLD_IMPORT, NEW_IMPORT);
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`Updated import in ${file}`);
  }
}

console.log(`Fixed imports in ${fixedCount} files.`);