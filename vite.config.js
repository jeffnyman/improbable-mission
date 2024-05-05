import postcssNesting from "postcss-nesting";
import { defineConfig } from "vite";

export default defineConfig({
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
});
