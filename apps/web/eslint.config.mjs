// apps/web/eslint.config.mjs
<<<<<<< HEAD
import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier/flat";
=======
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";
>>>>>>> bcf862b (chore: sync development → main (Fase 1 DX) (#3))

export default defineConfig([
  // 0) Ignorados globales
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
    "eslint.config.*",
  ]),

<<<<<<< HEAD
  // 1) Parser para TS/TSX
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },
=======
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base Next.js + TypeScript (tu config original)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignorados
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // evita que el editor lintée la propia config
      "eslint.config.*",
    ],
  },

  // Reglas y settings para import/* (sin volver a registrar el plugin)
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    settings: {
      // útil si activas no-unresolved o similares
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
    },
    rules: {
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/components/**",
              group: "internal",
              position: "before",
            },
            { pattern: "@/lib/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "import/no-duplicates": "error",
      "import/newline-after-import": ["error", { count: 1 }],
    },
  },

  // Desactiva choques con Prettier
  eslintConfigPrettier,
];
>>>>>>> bcf862b (chore: sync development → main (Fase 1 DX) (#3))

  // 2) JS/JSX
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
  },

  // 3) Reglas App Router (plugin de Next sin preset)
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { next: nextPlugin, import: importPlugin },
    settings: {
      next: { rootDir: "." }, // estamos ejecutando eslint desde apps/web
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
      "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
    },
    rules: {
      // App Router: reglas útiles de Next (sin depender de /pages)
      "next/no-img-element": "warn",
      "next/no-sync-scripts": "error",
      "next/no-css-tags": "error",
      "next/no-head-element": "error",
      "next/no-html-link-for-pages": "off", // explícitamente off

      // Tu orden de imports
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/components/**",
              group: "internal",
              position: "before",
            },
            { pattern: "@/lib/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "import/no-duplicates": "error",
      "import/newline-after-import": ["error", { count: 1 }],
    },
  },

  // 4) Prettier al final
  prettier,
]);
