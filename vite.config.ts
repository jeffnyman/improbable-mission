import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "import.meta.env.VITE_APP_TITLE": JSON.stringify("Improbable Mission"),
  },
});
