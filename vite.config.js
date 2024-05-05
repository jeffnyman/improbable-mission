import postcssNesting from "postcss-nesting";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/improbable-mission/",
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
});
