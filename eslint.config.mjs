import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended", prettierConfig],
    languageOptions: { globals: globals.browser },
  },
]);
