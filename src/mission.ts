import { audit } from "./utils/logger";
import { browser } from "./utils/browser";
import { engine } from "./engine";

audit(import.meta.env.VITE_APP_TITLE);

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}

browser.check();

audit("Browser ready; mission provided.");

const mission = browser.requireElement("mission");
mission.classList.remove("hidden");

const accept = browser.requireElement("accept");
accept.addEventListener("click", missionAccepted);

function missionAccepted() {
  audit("Mission has been accepted.");

  accept.removeEventListener("click", missionAccepted);
  mission.remove();

  engine.init();
}
