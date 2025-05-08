# Absolute Imports Migration Summary

## Overview

This project has been migrated from relative imports (e.g., `../../components/ui/button`) to absolute imports (e.g., `@ui/button`), improving code readability and maintainability.

## Changes Made

1. Updated `tsconfig.json` with path aliases
2. Updated `vite.config.ts` with corresponding path aliases
3. Converted all imports across 130 files from relative to absolute paths
4. Added scripts to check and update imports

## Path Aliases

The following path aliases are now available:

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

## Benefits

1. **Improved Readability**: No more complex relative paths like `../../../components/ui/button`
2. **Easier Refactoring**: Moving files no longer breaks imports
3. **Better IDE Support**: Autocomplete works better with path aliases
4. **Consistency**: All imports follow the same pattern

## Example Import Changes

Before:
```tsx
import { Button } from '../../../components/ui/button';
import { useAuthContext } from '../../context/AuthContext';
import websocketService from '../../../services/websocketService';
```

After:
```tsx
import { Button } from '@ui/button';
import { useAuthContext } from '@context/AuthContext';
import websocketService from '@services/websocketService';
```

## Maintenance

To ensure all new code follows this pattern, use the provided script:

```bash
pnpm check-imports
```

This will identify any relative imports that should be converted to absolute imports.

## Type System Improvements

A new schema file has been created at `src/schemas/schema.ts` to define the types used throughout the application. This schema file contains interfaces for forms, questions, responses, and other data structures.

## Utility Scripts

The following scripts have been created to help with the import migration:

- `check-imports.js`: Detects relative imports in the codebase
- `update-imports.js`: Automatically updates relative imports to absolute imports
- `fix-schema-imports-local.js`: Fixes imports from shared/schema to use the local schema file

## Known Issues (Updated)

The major type compatibility issues related to form components (`FormBuilder`, `CreateForm`, `EditForm`) and schema standardization have been resolved. The standard `tsc` build now passes.

Remaining potential issues (monitor during development):
1.  Missing TypeScript definitions for specific UI or third-party components (if encountered).
2.  Subtle Nullable vs undefined type issues (if encountered).

## Next Steps (Updated)

1.  ~~Fix remaining TypeScript errors in `src/components/form-builder/FormBuilder.tsx` and related files~~ (Resolved by standardizing types in `useForm`, `FormBuilder`, `CreateForm`, `EditForm`).
2.  ~~Add proper type definitions for JSX components~~ (Layout components checked and seem okay. Address specific components if errors arise).
3.  ~~Standardize the schema interfaces to ensure consistency across the codebase~~ (Resolved by updating `useForm` hook).
4.  Add type declarations (`@types/*`) for third-party libraries if missing-type errors occur.
5.  Remove the temporary `build-without-types.js` script as the standard build (`tsc && vite build`) is now working.