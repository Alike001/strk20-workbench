import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      react: { version: "19.2.8" },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  prettier,
  globalIgnores([
    ".agents/**",
    "**/.next/**",
    "coverage/**",
    "**/dist/**",
    "node_modules/**",
    "**/out/**",
    "**/next-env.d.ts",
  ]),
]);
