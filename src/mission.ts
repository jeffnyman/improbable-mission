import { audit } from "./utils/logger";
import { browser } from "./utils/browser";

audit(import.meta.env.VITE_APP_TITLE);

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}

browser.check();

audit("Browser ready; mission provided.");

const mission = browser.requireElement("mission");
mission.classList.remove("hidden");
