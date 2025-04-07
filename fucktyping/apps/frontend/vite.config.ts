import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    themePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "shared": path.resolve(__dirname, "../../packages/shared"),
      "webrtc-client": path.resolve(__dirname, "../../packages/webrtc-client"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});