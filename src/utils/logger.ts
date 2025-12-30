export const audit = (...args: readonly unknown[]) => {
  if (import.meta.env.PROD) {
    console.log("[AUDIT]", ...args);
  }
};

export const log = (...args: readonly unknown[]) => {
  if (import.meta.env.DEV) {
    console.log("[DEBUG]", ...args);
  }
};
