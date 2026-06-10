import { defineConfig } from "vitest/config";

// Local config so vitest doesn't climb to the monorepo-root vite.config.ts.
export default defineConfig({
  // Inline (empty) PostCSS config so Vite doesn't climb to the root postcss.config.js.
  css: { postcss: {} },
  test: { include: ["src/**/*.test.ts"] },
});
