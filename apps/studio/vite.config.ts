import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // Inline (empty) PostCSS config so the build doesn't climb to the monorepo-root
  // postcss.config.js (which pulls in tailwind, not a dep of this app).
  css: { postcss: {} },
});
