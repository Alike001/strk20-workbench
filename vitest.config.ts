import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
    },
    include: [
      "packages/**/tests/**/*.test.{ts,tsx}",
      "apps/**/tests/**/*.test.{ts,tsx}",
    ],
  },
});
