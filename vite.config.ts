import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import webfontDownload from "vite-plugin-webfont-dl";

export default defineConfig({
  base: "/improbable-mission/",

  define: {
    "import.meta.env.VITE_APP_TITLE": JSON.stringify("Improbable Mission"),
  },

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

    webfontDownload(
      [
        "https://fonts.googleapis.com/css2?family=Sixtyfour:SCAN@18&display=swap",
      ],
      {
        throwError: true,
        assetsSubfolder: "fonts",
      },
    ),
  ],
});
