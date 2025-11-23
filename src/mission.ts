import { log } from "./utils/logger";
import { browser } from "./utils/browser";

log(import.meta.env.VITE_APP_TITLE);

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}

browser.check();

log("Browser ready; mission provided.");

const mission = browser.requireElement("mission");
mission.classList.remove("hidden");
