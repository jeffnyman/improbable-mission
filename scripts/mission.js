import { Engine } from "./engine";

const game = "Improbable Mission";

console.log(`... ${game} ...`);
console.log("Browser ready; mission provided.");

document.documentElement.classList.replace("no-js", "js");

document
  .getElementById("accept")
  .addEventListener("click", () => missionAccepted());

function missionAccepted() {
  console.log("Mission has been accepted.");

  document.getElementById("mission").remove();
  document.getElementById("app").classList.remove("hidden");

  const engine = new Engine();
  engine.init();
}
