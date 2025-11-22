const log = (...args: readonly unknown[]) => {
  if (import.meta.env.DEV) {
    console.log("[DEBUG]", ...args);
  }
};

log(import.meta.env.VITE_APP_TITLE);

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}
