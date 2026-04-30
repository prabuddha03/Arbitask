import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/modules/**/*.ts", "lib/**/*.ts"],
      exclude: ["**/*.swagger.ts", "**/*.test.ts", "lib/db.ts"],
    },
    setupFiles: [],
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
