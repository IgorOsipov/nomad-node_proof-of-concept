import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  build: {
    manifest: "manifest.json",
    minify: mode === "production",
    sourcemap: mode === "development",
    rollupOptions: {
      input: {
        announcer: "./src/apps/announcer/main.ts",
        analytics: "./src/apps/analytics/main.ts",
      },
    },
  },
}));
