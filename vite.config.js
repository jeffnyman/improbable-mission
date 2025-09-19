import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === "production" || command === "build";

  return {
    base: isProduction ? "/improbable-mission/" : "/",
  };
});
