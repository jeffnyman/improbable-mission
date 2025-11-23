import { log } from "./utils/logger";
import { browser } from "./utils/browser";
import { Engine } from "./engine";

log(import.meta.env.VITE_APP_TITLE);

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}

browser.check();

log("Browser ready; mission provided.");

const mission = browser.requireElement("mission");
mission.classList.remove("hidden");

const accept = browser.requireElement("accept");
accept.addEventListener("click", missionAccepted);

function missionAccepted() {
  log("Mission has been accepted.");

  accept.removeEventListener("click", missionAccepted);
  mission.remove();

  new Engine().init();
}
