#!/bin/bash

echo "Manually updating imports in individual files..."

# Define the base directory
BASE_DIR="/Users/hutch/Documents/projects/yakyak/case_study/fucktyping/apps/frontend"

# Update FormContext.tsx
echo "Fixing src/context/FormContext.tsx"
sed -i '' 's|import { useAuthContext } from "./AuthContext";|import { useAuthContext } from "@context/AuthContext";|g' "$BASE_DIR/src/context/FormContext.tsx"

# Update FormContext.jsx
echo "Fixing src/context/FormContext.jsx"
sed -i '' 's|import { useAuthContext } from "./AuthContext";|import { useAuthContext } from "@context/AuthContext";|g' "$BASE_DIR/src/context/FormContext.jsx"

# Update toggle-group.tsx
echo "Fixing src/components/ui/toggle-group.tsx"
sed -i '' 's|import { toggleVariants } from "./toggle"|import { toggleVariants } from "@ui/toggle"|g' "$BASE_DIR/src/components/ui/toggle-group.tsx"

# Update sidebar.tsx
echo "Fixing src/components/ui/sidebar.tsx"
sed -i '' 's|import { Sheet, SheetContent, SheetTrigger } from "./sheet"|import { Sheet, SheetContent, SheetTrigger } from "@ui/sheet"|g' "$BASE_DIR/src/components/ui/sidebar.tsx"

# Update Layout.jsx
echo "Fixing src/components/layout/Layout.jsx"
sed -i '' 's|import Sidebar from "./Sidebar";|import Sidebar from "@components/layout/Sidebar";|g' "$BASE_DIR/src/components/layout/Layout.jsx"
sed -i '' 's|import TopNavBar from "./TopNavBar";|import TopNavBar from "@components/layout/TopNavBar";|g' "$BASE_DIR/src/components/layout/Layout.jsx"
sed -i '' 's|import MobileNav from "./MobileNav";|import MobileNav from "@components/layout/MobileNav";|g' "$BASE_DIR/src/components/layout/Layout.jsx"

# Update Header.tsx
echo "Fixing src/components/layout/Header.tsx"
sed -i '' 's|import UserMenu from "./UserMenu";|import UserMenu from "@components/layout/UserMenu";|g' "$BASE_DIR/src/components/layout/Header.tsx"

# Update ResponseViewer.jsx
echo "Fixing src/components/dashboard/ResponseViewer.jsx"
sed -i '' 's|import Card from "../common/Card";|import Card from "@components/common/Card";|g' "$BASE_DIR/src/components/dashboard/ResponseViewer.jsx"
sed -i '' 's|import Button from "../common/Button";|import Button from "@components/common/Button";|g' "$BASE_DIR/src/components/dashboard/ResponseViewer.jsx"

# Update FormsList.jsx
echo "Fixing src/components/dashboard/FormsList.jsx"
sed -i '' 's|import Card from "../common/Card";|import Card from "@components/common/Card";|g' "$BASE_DIR/src/components/dashboard/FormsList.jsx"
sed -i '' 's|import Button from "../common/Button";|import Button from "@components/common/Button";|g' "$BASE_DIR/src/components/dashboard/FormsList.jsx"

# Update Analytics.jsx
echo "Fixing src/components/dashboard/Analytics.jsx"
sed -i '' 's|import Card from "../common/Card";|import Card from "@components/common/Card";|g' "$BASE_DIR/src/components/dashboard/Analytics.jsx"

# Update Modal.jsx
echo "Fixing src/components/common/Modal.jsx"
sed -i '' 's|import Button from "./Button";|import Button from "@components/common/Button";|g' "$BASE_DIR/src/components/common/Modal.jsx"
sed -i '' 's|import { Dialog,|import { Dialog,|g' "$BASE_DIR/src/components/common/Modal.jsx"
sed -i '' 's|} from "./components/ui/dialog";|} from "@ui/dialog";|g' "$BASE_DIR/src/components/common/Modal.jsx"

echo "All fixes applied."