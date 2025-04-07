// Check if imports are using the path aliases instead of relative paths
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

console.log(`Checking ${files.length} files for relative imports...`);

const relativePaths = [];
const importRegex = /import\s+(?:.+\s+from\s+)?['"](\.[^'"]+)['"]/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relImports = [];
  let match;
  
  // Reset regex state for each file
  importRegex.lastIndex = 0;
  
  while ((match = importRegex.exec(content)) !== null) {
    relImports.push(match[1]);
  }
  
  if (relImports.length > 0) {
    relativePaths.push({
      file: path.relative(path.resolve(__dirname, '..'), file),
      imports: relImports
    });
  }
});

if (relativePaths.length === 0) {
  console.log('✅ No relative imports found!');
} else {
  console.log('❌ Found files with relative imports:');
  
  relativePaths.forEach(({ file, imports }) => {
    console.log(`\n${file}:`);
    imports.forEach(imp => console.log(`  - ${imp}`));
  });
  
  console.log(`\nTotal: ${relativePaths.length} files with relative imports`);
  console.log('Suggestion: Update these imports to use path aliases like @ui/, @components/, @lib/, etc.');
}