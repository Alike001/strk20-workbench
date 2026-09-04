import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["packages/lab-core/src/**/*.ts"],
      thresholds: {
        lines: 85,
        branches: 85,
      },
    },
    include: [
      "packages/**/tests/**/*.test.{ts,tsx}",
      "apps/**/tests/**/*.test.{ts,tsx}",
    ],
  },
});
