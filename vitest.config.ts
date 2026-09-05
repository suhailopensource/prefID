import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      reporter: ["text", "html"],
      thresholds: {
        statements: 99,
        branches: 98,
        functions: 100,
        lines: 99,
      },
    },
  },
});
