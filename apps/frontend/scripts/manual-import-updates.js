// Manually update specific imports for files that were missed
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const updates = [
  {
    file: 'src/services/formService.ts',
    updates: [
      {
        from: 'import { api } from "./api";',
        to: 'import { api } from "@services/api";'
      }
    ]
  },
  {
    file: 'src/services/formService.js',
    updates: [
      {
        from: "import { get, post, put, del } from './api';",
        to: "import { get, post, put, del } from '@services/api';"
      }
    ]
  },
  {
    file: 'src/services/conversationService.js',
    updates: [
      {
        from: "import { get, post } from './api';",
        to: "import { get, post } from '@services/api';"
      }
    ]
  },
  {
    file: 'src/context/FormContext.tsx',
    updates: [
      {
        from: "import { useAuthContext } from './AuthContext';",
        to: "import { useAuthContext } from '@context/AuthContext';"
      }
    ]
  },
  {
    file: 'src/context/FormContext.jsx',
    updates: [
      {
        from: "import { useAuthContext } from './AuthContext';",
        to: "import { useAuthContext } from '@context/AuthContext';"
      }
    ]
  },
  {
    file: 'src/components/ui/toggle-group.tsx',
    updates: [
      {
        from: "import { Toggle, toggleVariants } from './toggle'",
        to: "import { Toggle, toggleVariants } from '@ui/toggle'"
      }
    ]
  },
  {
    file: 'src/components/ui/sidebar.tsx',
    updates: [
      {
        from: 'import { Button } from "./button"',
        to: 'import { Button } from "@ui/button"'
      },
      {
        from: 'import { Input } from "./input"',
        to: 'import { Input } from "@ui/input"'
      },
      {
        from: 'import { Separator } from "./separator"',
        to: 'import { Separator } from "@ui/separator"'
      },
      {
        from: 'import { Sheet, SheetContent, SheetTrigger } from "./sheet"',
        to: 'import { Sheet, SheetContent, SheetTrigger } from "@ui/sheet"'
      },
      {
        from: 'import { Skeleton } from "./skeleton"',
        to: 'import { Skeleton } from "@ui/skeleton"'
      }
    ]
  },
  {
    file: 'src/components/layout/Layout.jsx',
    updates: [
      {
        from: "import Sidebar from './Sidebar';",
        to: "import Sidebar from '@components/layout/Sidebar';"
      },
      {
        from: "import TopNavBar from './TopNavBar';",
        to: "import TopNavBar from '@components/layout/TopNavBar';"
      },
      {
        from: "import MobileNav from './MobileNav';",
        to: "import MobileNav from '@components/layout/MobileNav';"
      }
    ]
  },
  {
    file: 'src/components/layout/Header.tsx',
    updates: [
      {
        from: "import UserMenu from './UserMenu';",
        to: "import UserMenu from '@components/layout/UserMenu';"
      }
    ]
  },
  {
    file: 'src/components/dashboard/ResponseViewer.jsx',
    updates: [
      {
        from: "import Card from '../common/Card';",
        to: "import Card from '@components/common/Card';"
      },
      {
        from: "import Button from '../common/Button';",
        to: "import Button from '@components/common/Button';"
      }
    ]
  },
  {
    file: 'src/components/dashboard/FormsList.jsx',
    updates: [
      {
        from: "import Card from '../common/Card';",
        to: "import Card from '@components/common/Card';"
      },
      {
        from: "import Button from '../common/Button';",
        to: "import Button from '@components/common/Button';"
      }
    ]
  },
  {
    file: 'src/components/dashboard/Analytics.jsx',
    updates: [
      {
        from: "import Card from '../common/Card';",
        to: "import Card from '@components/common/Card';"
      }
    ]
  },
  {
    file: 'src/components/common/Modal.jsx',
    updates: [
      {
        from: "import Button from './Button';",
        to: "import Button from '@components/common/Button';"
      }
    ]
  }
];

console.log(`Processing ${updates.length} manual updates...`);

let filesUpdated = 0;
let importsUpdated = 0;

for (const update of updates) {
  const filePath = path.join(rootDir, update.file);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${update.file}`);
    continue;
  }
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileUpdated = false;
  
  // Apply each update for this file
  for (const change of update.updates) {
    if (content.includes(change.from)) {
      content = content.replace(change.from, change.to);
      importsUpdated++;
      fileUpdated = true;
    } else {
      console.log(`❌ Could not find import '${change.from}' in ${update.file}`);
    }
  }
  
  // Save the file if changes were made
  if (fileUpdated) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesUpdated++;
    console.log(`✅ Updated imports in ${update.file}`);
  }
}

console.log('\nSummary:');
console.log(`- Files checked: ${updates.length}`);
console.log(`- Files updated: ${filesUpdated}`);
console.log(`- Imports updated: ${importsUpdated}`);
console.log('✨ Done!');