import { Engine } from "./engine";

const game = "Improbable Mission";

console.log(`... ${game} ...`);
console.log("Browser ready; mission provided.");

document.documentElement.classList.replace("no-js", "js");

const acceptMission = document.getElementById("accept-mission");

if (acceptMission) {
  acceptMission.addEventListener("click", () => missionAccepted());
} else {
  console.error("Element with id 'accept-mission' not found.");
}

function missionAccepted() {
  console.log("Mission has been accepted.");

  const missionDiv = document.getElementById("mission");

  if (missionDiv) {
    missionDiv.remove();
  } else {
    console.error("Element with id 'mission' not found.");
  }

  const appDiv = document.getElementById("app");

  if (appDiv) {
    appDiv.classList.remove("hidden");
  } else {
    console.error("Element with id 'app' not found.");
  }

  const engine = new Engine();
  engine.init();
}
