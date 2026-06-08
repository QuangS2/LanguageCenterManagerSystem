import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
    css: true,
    coverage: {
      provider: "v8",

      reporter: ["text", "json", "html"],

      reportsDirectory: "./coverage",
      include: ["src/components/**", "src/context/**", "src/pages/**"],
    },
    reporters: ["default", "html"],

    outputFile: {
      html: "./test-report/index.html",
    },
  },
});
