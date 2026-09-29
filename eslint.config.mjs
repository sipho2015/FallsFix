import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["src/frontend/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{
        group: ["@/backend/**", "**/backend/**", "**/generated/**", "@/app/**"],
        message: "Keep UI and shared code independent of backend/database modules. Use shared schemas or an API boundary.",
      }] }],
    },
  },
  {
    files: ["src/backend/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{
        group: ["@/frontend/**", "**/frontend/**", "@/app/**"],
        message: "Business logic must not depend on UI or route entry points.",
      }] }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "dist/**",
    "coverage/**",
    "generated/**",
    ".local/**",
    "next-env.d.ts",
  ]),
]);
