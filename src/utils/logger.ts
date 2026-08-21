const loggedMessages = new Set<string>();

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

export const logOnce = (...args: readonly unknown[]) => {
  if (import.meta.env.DEV) {
    const key = JSON.stringify(args);

    if (!loggedMessages.has(key)) {
      loggedMessages.add(key);
      console.log("[DEBUG]", ...args);
    }
  }
};
