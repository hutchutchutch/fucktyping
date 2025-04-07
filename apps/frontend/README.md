# FuckTyping - Frontend

This is the frontend application for the FuckTyping voice-first form platform.

## Development

```bash
# Install dependencies
pnpm install

# Start development server with type checking
pnpm dev

# Start development server without type checking (if there are TS errors)
pnpm dev-no-types
```

## Building

```bash
# Build with TypeScript validation
pnpm build

# Build without TypeScript validation (if there are TS errors)
pnpm build-no-types
```

## Import Structure

This project uses absolute imports to improve code readability and maintainability. Instead of using relative paths like `../../components/ui/button`, we use path aliases like `@ui/button`. For more details, see [IMPORTS.md](./IMPORTS.md).

### Available Import Aliases

| Alias | Path | Description |
|-------|------|-------------|
| `@/*` | `./src/*` | Access any file from the src directory |
| `@app/*` | `./src/*` | Access any file from the src directory (alternative) |
| `@components/*` | `./src/components/*` | All React components |
| `@ui/*` | `./src/components/ui/*` | UI components (buttons, cards, inputs, etc.) |
| `@pages/*` | `./src/pages/*` | Page components |
| `@hooks/*` | `./src/hooks/*` | Custom React hooks |
| `@services/*` | `./src/services/*` | API and service functions |
| `@context/*` | `./src/context/*` | React contexts |
| `@lib/*` | `./src/lib/*` | Utility libraries |
| `@utils/*` | `./src/utils/*` | Utility functions |
| `@schemas/*` | `./src/schemas/*` | TypeScript schemas and types |
| `@shared/*` | `../../packages/shared/*` | Shared code from the shared package |
| `@webrtc/*` | `../../packages/webrtc-client/*` | WebRTC client code |

### Examples

```tsx
// Before
import { Button } from '../../../components/ui/button';
import { useAuthContext } from '../../context/AuthContext';
import websocketService from '../../../services/websocketService';

// After
import { Button } from '@ui/button';
import { useAuthContext } from '@context/AuthContext';
import websocketService from '@services/websocketService';
```

### Checking Import Compliance

You can check if any file is still using relative imports with:

```bash
pnpm check-imports
```

This will scan all TypeScript and JavaScript files in the src directory and report any that are still using relative imports.

## Type System

The project uses TypeScript for type safety. A local schema system has been created in `/src/schemas/schema.ts` to define data structures used throughout the application.

Note: There are currently some TypeScript errors that need to be resolved. The `dev-no-types` and `build-no-types` scripts can be used to bypass these issues temporarily.