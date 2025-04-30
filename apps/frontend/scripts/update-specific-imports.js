// Update specific remaining relative imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Specific files to update
const specificUpdates = [
  {
    filePath: 'src/services/formService.ts',
    oldImport: "import api from './api';",
    newImport: "import api from '@services/api';"
  },
  {
    filePath: 'src/services/formService.js',
    oldImport: "import api from './api';",
    newImport: "import api from '@services/api';"
  },
  {
    filePath: 'src/services/conversationService.js',
    oldImport: "import api from './api';",
    newImport: "import api from '@services/api';"
  },
  {
    filePath: 'src/services/categoryData.ts',
    oldImport: "import { mockForms } from './mockData';",
    newImport: "import { mockForms } from '@services/mockData';"
  },
  {
    filePath: 'src/context/FormContext.tsx',
    oldImport: "import { useAuthContext } from './AuthContext';",
    newImport: "import { useAuthContext } from '@context/AuthContext';"
  },
  {
    filePath: 'src/context/FormContext.jsx',
    oldImport: "import { useAuthContext } from './AuthContext';",
    newImport: "import { useAuthContext } from '@context/AuthContext';"
  },
  {
    filePath: 'src/components/ui/toggle-group.tsx',
    oldImport: "import { Toggle, toggleVariants } from './toggle';",
    newImport: "import { Toggle, toggleVariants } from '@ui/toggle';"
  },
  {
    filePath: 'src/components/ui/sidebar.tsx',
    oldImport: `import { Button } from "./button"
import { Input } from "./input"
import { Separator } from "./separator"
import { Sheet, SheetContent, SheetTrigger } from "./sheet"
import { Skeleton } from "./skeleton"`,
    newImport: `import { Button } from "@ui/button"
import { Input } from "@ui/input"
import { Separator } from "@ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@ui/sheet"
import { Skeleton } from "@ui/skeleton"`
  },
  {
    filePath: 'src/components/ui/pagination.tsx',
    oldImport: 'import { ButtonProps, buttonVariants } from "./button"',
    newImport: 'import { ButtonProps, buttonVariants } from "@ui/button"'
  },
  {
    filePath: 'src/components/ui/form.tsx',
    oldImport: 'import { Label } from "./label"',
    newImport: 'import { Label } from "@ui/label"'
  },
  {
    filePath: 'src/components/ui/command.tsx',
    oldImport: 'import { Dialog, DialogContent } from "./dialog"',
    newImport: 'import { Dialog, DialogContent } from "@ui/dialog"'
  },
  {
    filePath: 'src/components/ui/carousel.tsx',
    oldImport: 'import { Button } from "./button"',
    newImport: 'import { Button } from "@ui/button"'
  },
  {
    filePath: 'src/components/ui/calendar.tsx',
    oldImport: 'import { buttonVariants } from "./button"',
    newImport: 'import { buttonVariants } from "@ui/button"'
  },
  {
    filePath: 'src/components/ui/alert-dialog.tsx',
    oldImport: 'import { buttonVariants } from "./button"',
    newImport: 'import { buttonVariants } from "@ui/button"'
  },
  {
    filePath: 'src/components/layout/Layout.jsx',
    oldImport: `import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import MobileNav from './MobileNav';`,
    newImport: `import Sidebar from '@components/layout/Sidebar';
import TopNavBar from '@components/layout/TopNavBar';
import MobileNav from '@components/layout/MobileNav';`
  },
  {
    filePath: 'src/components/layout/Header.tsx',
    oldImport: "import UserMenu from './UserMenu';",
    newImport: "import UserMenu from '@components/layout/UserMenu';"
  },
  {
    filePath: 'src/components/layout/AppLayout.tsx',
    oldImport: `import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';`,
    newImport: `import Header from '@components/layout/Header';
import Sidebar from '@components/layout/Sidebar';
import MobileNav from '@components/layout/MobileNav';`
  },
  {
    filePath: 'src/components/form-responder/VoiceRecorder.tsx',
    oldImport: `import AudioVisualizer from './AudioVisualizer';
import Transcript from './Transcript';`,
    newImport: `import AudioVisualizer from '@components/form-responder/AudioVisualizer';
import Transcript from '@components/form-responder/Transcript';`
  },
  {
    filePath: 'src/components/form-responder/VoiceInterface.tsx',
    oldImport: "import AudioVisualizer from './AudioVisualizer';",
    newImport: "import AudioVisualizer from '@components/form-responder/AudioVisualizer';"
  },
  {
    filePath: 'src/components/form-responder/VoiceFormResponder.tsx',
    oldImport: `import VoiceInterface from './VoiceInterface';
import Transcript from './Transcript';`,
    newImport: `import VoiceInterface from '@components/form-responder/VoiceInterface';
import Transcript from '@components/form-responder/Transcript';`
  },
  {
    filePath: 'src/components/form-builder/FormBuilder.tsx',
    oldImport: `import QuestionEditor from './QuestionEditor';
import EmailTemplateEditor from './EmailTemplateEditor';`,
    newImport: `import QuestionEditor from '@components/form-builder/QuestionEditor';
import EmailTemplateEditor from '@components/form-builder/EmailTemplateEditor';`
  },
  {
    filePath: 'src/components/dashboard/ResponseViewer.jsx',
    oldImport: `import Card from '../common/Card';
import Button from '../common/Button';`,
    newImport: `import Card from '@components/common/Card';
import Button from '@components/common/Button';`
  },
  {
    filePath: 'src/components/dashboard/FormsList.jsx',
    oldImport: `import Card from '../common/Card';
import Button from '../common/Button';`,
    newImport: `import Card from '@components/common/Card';
import Button from '@components/common/Button';`
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

console.log(`Processing ${specificUpdates.length} specific updates...`);

let filesUpdated = 0;
let importUpdated = 0;

specificUpdates.forEach(update => {
  const { filePath, oldImport, newImport } = update;
  const fullPath = path.join(rootDir, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Check if old import exists
      if (content.includes(oldImport)) {
        content = content.replace(oldImport, newImport);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated imports in ${filePath}`);
        filesUpdated++;
        importUpdated++;
      } else {
        console.log(`❌ Could not find import in ${filePath}`);
      }
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
});

console.log(`\nSummary:`);
console.log(`- Total specific updates attempted: ${specificUpdates.length}`);
console.log(`- Files updated: ${filesUpdated}`);
console.log(`- Imports updated: ${importUpdated}`);
console.log('✨ Done!');