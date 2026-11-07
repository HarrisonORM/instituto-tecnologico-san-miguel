import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import typescript from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "dist/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
  js.configs.recommended,
  ...typescript.configs.recommended,
  { files: ["public/sw.js"], languageOptions: { globals: { self: "readonly", caches: "readonly", fetch: "readonly", URL: "readonly" } } },
  {
    ...nextPlugin.configs["core-web-vitals"],
    files: ["src/**/*.{ts,tsx}"],
  },
]);
