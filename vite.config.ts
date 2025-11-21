import { defineConfig } from "vite";

export default defineConfig({
  base: "/improbable-mission/",

  define: {
    "import.meta.env.VITE_APP_TITLE": JSON.stringify("Improbable Mission"),
  },
});
