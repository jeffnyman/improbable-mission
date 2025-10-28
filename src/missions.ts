import { Engine } from "./engine";
import { checkBrowser } from "./utils/checkBrowser";

console.log("Improbable Mission");

document.documentElement.classList.replace("no-js", "js");

if (document.location.search) {
  window.history.pushState({}, "", "/");
}

checkBrowser();

console.log("Browser ready; mission provided.");

document.getElementById("mission")?.classList.remove("hidden");
document.getElementById("accept")?.addEventListener("click", missionAccepted);

function missionAccepted() {
  console.log("Mission has been accepted.");

  document
    .getElementById("accept")
    ?.removeEventListener("click", missionAccepted);

  document.getElementById("mission")?.remove();
  document.getElementById("loading")?.classList.remove("hidden");

  const engine = new Engine();
  engine.init();
}
