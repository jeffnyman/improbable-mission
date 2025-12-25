import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig({
  base: "/improbable-mission/",

  plugins: [
    checker({
      typescript: true,

      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.ts"',
      },

      stylelint: {
        lintCommand: 'stylelint "styles/**/*.css"',
      },
    }),
  ],
});
