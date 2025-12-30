import { browser } from "./utils/browser";

if (import.meta.env.DEV) {
  console.log(import.meta.env.VITE_APP_TITLE);
}

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}

browser.check();

if (import.meta.env.DEV) {
  console.log("Browser ready; mission provided.");
}
