import { localIconPlugin } from "./scripts/local-icon-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ command }) => ({
  base: "./",
  optimizeDeps: { entries: ["index.html", "player.html", "latest.html"] },
  build: { rollupOptions: { input: ["index.html", "latest.html"] } },
  plugins: [
    localIconPlugin(command),
    react(),

  ],
}));
