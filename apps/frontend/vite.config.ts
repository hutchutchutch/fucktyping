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
      "@app": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@ui": path.resolve(__dirname, "src/components/ui"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@services": path.resolve(__dirname, "src/services"),
      "@context": path.resolve(__dirname, "src/context"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@schemas": path.resolve(__dirname, "src/schemas"),
      "@shared": path.resolve(__dirname, "../../packages/shared"),
      "@webrtc": path.resolve(__dirname, "../../packages/webrtc-client"),
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