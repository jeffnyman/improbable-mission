import "../styles/mission.css";

console.log("... Improbable Mission ...");
console.log("Browser ready; mission provided.");

const acceptMissionSpan =
  document.querySelector<HTMLSpanElement>("#accept-mission")!;

acceptMissionSpan.addEventListener("click", () => missionAccepted());

function missionAccepted() {
  console.log("Mission has been accepted.");
}
