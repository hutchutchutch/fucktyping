// Update relative imports to use path aliases
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Get current file directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Path mapping configuration
const pathMappings = [
  {
    prefix: './components/ui/',
    replacement: '@ui/'
  },
  {
    prefix: '../components/ui/',
    replacement: '@ui/'
  },
  {
    prefix: '../../components/ui/',
    replacement: '@ui/'
  },
  {
    prefix: './components/form-builder/',
    replacement: '@components/form-builder/'
  },
  {
    prefix: '../components/form-builder/',
    replacement: '@components/form-builder/'
  },
  {
    prefix: './components/form-responder/',
    replacement: '@components/form-responder/'
  },
  {
    prefix: '../components/form-responder/',
    replacement: '@components/form-responder/'
  },
  {
    prefix: './components/dashboard/',
    replacement: '@components/dashboard/'
  },
  {
    prefix: '../components/dashboard/',
    replacement: '@components/dashboard/'
  },
  {
    prefix: './components/layout/',
    replacement: '@components/layout/'
  },
  {
    prefix: '../components/layout/',
    replacement: '@components/layout/'
  },
  {
    prefix: './components/common/',
    replacement: '@components/common/'
  },
  {
    prefix: '../components/common/',
    replacement: '@components/common/'
  },
  {
    prefix: './components/voice-agent/',
    replacement: '@components/voice-agent/'
  },
  {
    prefix: '../components/voice-agent/',
    replacement: '@components/voice-agent/'
  },
  {
    prefix: './components/ai/',
    replacement: '@components/ai/'
  },
  {
    prefix: '../components/ai/',
    replacement: '@components/ai/'
  },
  {
    prefix: './components/onboarding/',
    replacement: '@components/onboarding/'
  },
  {
    prefix: '../components/onboarding/',
    replacement: '@components/onboarding/'
  },
  {
    prefix: './context/',
    replacement: '@context/'
  },
  {
    prefix: '../context/',
    replacement: '@context/'
  },
  {
    prefix: '../../context/',
    replacement: '@context/'
  },
  {
    prefix: './hooks/',
    replacement: '@hooks/'
  },
  {
    prefix: '../hooks/',
    replacement: '@hooks/'
  },
  {
    prefix: '../../hooks/',
    replacement: '@hooks/'
  },
  {
    prefix: './services/',
    replacement: '@services/'
  },
  {
    prefix: '../services/',
    replacement: '@services/'
  },
  {
    prefix: '../../services/',
    replacement: '@services/'
  },
  {
    prefix: './lib/',
    replacement: '@lib/'
  },
  {
    prefix: '../lib/',
    replacement: '@lib/'
  },
  {
    prefix: '../../lib/',
    replacement: '@lib/'
  },
  {
    prefix: './pages/',
    replacement: '@pages/'
  },
  {
    prefix: '../pages/',
    replacement: '@pages/'
  },
  {
    prefix: '../../pages/',
    replacement: '@pages/'
  },
  {
    prefix: '../../../shared/',
    replacement: '@shared/'
  },
  {
    prefix: './utils/',
    replacement: '@utils/'
  },
  {
    prefix: '../utils/',
    replacement: '@utils/'
  },
  {
    prefix: '../../utils/',
    replacement: '@utils/'
  },
  {
    prefix: './App',
    replacement: '@app/App'
  },
  {
    prefix: '../App',
    replacement: '@app/App'
  },
  {
    prefix: './index.css',
    replacement: '@app/index.css'
  }
];

// Get all TypeScript and JavaScript files
const files = globSync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: rootDir,
  absolute: true,
});

console.log(`Processing ${files.length} files...`);

// Track stats
let filesUpdated = 0;
let totalImportsReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let importsReplaced = 0;
  
  // Find all import statements with relative paths
  const importRegex = /import\s+(?:.+\s+from\s+)?['"](\.[^'"]+)['"]/g;
  let imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      fullMatch: match[0],
      path: match[1]
    });
  }
  
  // Process each import to replace with absolute path
  imports.forEach(importInfo => {
    const { fullMatch, path } = importInfo;
    
    // Find a matching path mapping
    for (const mapping of pathMappings) {
      if (path.startsWith(mapping.prefix)) {
        // Create replacement import
        const newPath = path.replace(mapping.prefix, mapping.replacement);
        const newImport = fullMatch.replace(path, newPath);
        
        // Replace in content
        content = content.replace(fullMatch, newImport);
        importsReplaced++;
        totalImportsReplaced++;
        break;
      }
    }
  });
  
  // Only write file if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesUpdated++;
    console.log(`✅ Updated ${importsReplaced} imports in ${path.relative(rootDir, file)}`);
  }
});

console.log(`\nSummary:`);
console.log(`- Total files processed: ${files.length}`);
console.log(`- Files updated: ${filesUpdated}`);
console.log(`- Total imports replaced: ${totalImportsReplaced}`);
console.log('✨ Done!');