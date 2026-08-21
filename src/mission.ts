import { audit } from "./utils/logger";
import { audio } from "./common/audioManager";
import { browser } from "./utils/browser";
import { engine } from "./engine";
import { missionCrawl } from "./ui/missionCrawl";

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}

audit("Improbable Mission");

browser.check();

audit("Browser ready; mission provided.");

const mission = browser.requireElement("mission");
mission.classList.remove("hidden");

const accept = browser.requireElement("accept");
accept.addEventListener("click", missionAccepted);

async function missionAccepted() {
  audit("Mission has been accepted.");

  accept.removeEventListener("click", missionAccepted);
  mission.remove();

  // The crawl now stands between this click and engine.init(), so the
  // gesture is long gone by the time the engine wants to resume the
  // AudioContext. Unlocking it here, while the click is still on the
  // stack, is what keeps the intro speech audible.
  audio.unlock();

  await missionCrawl.run();

  engine.init();
}

