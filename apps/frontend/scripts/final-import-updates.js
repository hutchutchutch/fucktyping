// Final import updates for remaining files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// These are exact replacements based on the file contents
const updates = [
  {
    filePath: 'src/services/conversationService.js',
    oldImport: "import { post, get } from './api';",
    newImport: "import { post, get } from '@services/api';"
  },
  {
    filePath: 'src/context/FormContext.tsx',
    oldImport: "import { AuthContext } from './AuthContext';",
    newImport: "import { AuthContext } from '@context/AuthContext';"
  },
  {
    filePath: 'src/context/FormContext.jsx',
    oldImport: "import { AuthContext } from './AuthContext';",
    newImport: "import { AuthContext } from '@context/AuthContext';"
  },
  {
    filePath: 'src/components/ui/toggle-group.tsx',
    oldImport: "import { Toggle, toggleVariants } from \"./toggle\"",
    newImport: "import { Toggle, toggleVariants } from \"@ui/toggle\""
  },
  {
    filePath: 'src/components/ui/sidebar.tsx',
    oldImport: "import { Sheet, SheetContent, SheetTrigger } from \"./sheet\"",
    newImport: "import { Sheet, SheetContent, SheetTrigger } from \"@ui/sheet\""
  },
  {
    filePath: 'src/components/layout/Layout.jsx',
    oldImport: "import Sidebar from './Sidebar';",
    newImport: "import Sidebar from '@components/layout/Sidebar';"
  },
  {
    filePath: 'src/components/layout/Layout.jsx',
    oldImport: "import TopNavBar from './TopNavBar';",
    newImport: "import TopNavBar from '@components/layout/TopNavBar';"
  },
  {
    filePath: 'src/components/layout/Layout.jsx',
    oldImport: "import MobileNav from './MobileNav';",
    newImport: "import MobileNav from '@components/layout/MobileNav';"
  },
  {
    filePath: 'src/components/layout/Header.tsx',
    oldImport: "import UserMenu from './UserMenu';",
    newImport: "import UserMenu from '@components/layout/UserMenu';"
  },
  {
    filePath: 'src/components/dashboard/ResponseViewer.jsx',
    oldImport: "import Card from '../common/Card';",
    newImport: "import Card from '@components/common/Card';"
  },
  {
    filePath: 'src/components/dashboard/ResponseViewer.jsx',
    oldImport: "import Button from '../common/Button';",
    newImport: "import Button from '@components/common/Button';"
  },
  {
    filePath: 'src/components/dashboard/FormsList.jsx',
    oldImport: "import Card from '../common/Card';",
    newImport: "import Card from '@components/common/Card';"
  },
  {
    filePath: 'src/components/dashboard/FormsList.jsx',
    oldImport: "import Button from '../common/Button';",
    newImport: "import Button from '@components/common/Button';"
  },
  {
    filePath: 'src/components/dashboard/Analytics.jsx',
    oldImport: "import Card from '../common/Card';",
    newImport: "import Card from '@components/common/Card';"
  },
  {
    filePath: 'src/components/common/Modal.jsx',
    oldImport: "import Button from './Button';",
    newImport: "import Button from '@components/common/Button';"
  }
];

console.log(`Processing ${updates.length} final updates...`);

let totalUpdated = 0;

for (const update of updates) {
  const fullPath = path.join(rootDir, update.filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes(update.oldImport)) {
        const updatedContent = content.replace(update.oldImport, update.newImport);
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        console.log(`✅ Updated: ${update.filePath}`);
        totalUpdated++;
      } else {
        console.log(`❌ Import pattern not found in: ${update.filePath}`);
        // Log the first lines to help debug
        const lines = content.split('\n').slice(0, 10).join('\n');
        console.log('First 10 lines:');
        console.log(lines);
      }
    } else {
      console.log(`❌ File not found: ${update.filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${update.filePath}:`, err);
  }
}

console.log(`\nSummary: Updated ${totalUpdated} out of ${updates.length} imports`);