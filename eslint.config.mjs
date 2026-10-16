import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  { settings: { next: { rootDir: ["frontend/", "backend/"] } } },
  {
    files: ["frontend/components/**/*.{ts,tsx}", "frontend/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{
        group: ["@/backend/**", "**/backend/**", "**/generated/**", "@/app/**"],
        message: "Keep UI and shared code independent of backend/database modules. Use shared schemas or an API boundary.",
      }] }],
    },
  },
  {
    files: ["backend/auth/**/*.{ts,tsx}", "backend/authorization/**/*.{ts,tsx}", "backend/operations/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{
        group: ["@/frontend/**", "**/frontend/**", "@/app/**"],
        message: "Business logic must not depend on UI or route entry points.",
      }] }],
    },
  },
  globalIgnores([
    ".next/**",
    ".next-*/**",
    "frontend/.next/**",
    "frontend/.next-*/**",
    "backend/.next/**",
    "backend/.next-*/**",
    "out/**",
    "dist/**",
    "coverage/**",
    "database/generated/**",
    ".local/**",
    "next-env.d.ts",
    "frontend/next-env.d.ts",
    "backend/next-env.d.ts",
  ]),
]);
