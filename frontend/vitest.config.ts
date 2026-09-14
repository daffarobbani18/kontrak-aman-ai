import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    // Simulasi browser environment untuk komponen React
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Cakupan minimum 70% untuk hooks/services/utils sesuai AGENTS.md
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      include: ["src/features/**/hooks/**", "src/features/**/services/**", "src/lib/**"],
      exclude: ["src/features/**/components/**", "src/**/*.test.ts", "src/**/*.test.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
