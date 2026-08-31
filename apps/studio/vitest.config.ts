import { defineConfig } from "vitest/config";

// Local config so vitest doesn't inherit the monorepo-root vite/postcss config.
// `css.postcss: {}` is an inline (empty) PostCSS config, which stops Vite from
// searching upward and loading the root postcss.config.js (tailwind).
export default defineConfig({
  css: { postcss: {} },
  test: { include: ["src/**/*.test.ts"] },
});
