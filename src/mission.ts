if (import.meta.env.DEV) {
  console.log(import.meta.env.VITE_APP_TITLE);
}

if (document.location.search) {
  window.history.pushState({}, "", "/");
}
