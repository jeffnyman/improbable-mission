import "../styles/mission.css";

const game = "Improbable Mission";

console.log(`... ${game} ...`);
console.log("Browser ready; mission provided.");

const acceptMissionSpan =
  document.querySelector<HTMLSpanElement>("#accept-mission");

if (acceptMissionSpan) {
  acceptMissionSpan.addEventListener("click", () => missionAccepted());
} else {
  console.error("Element with id 'accept-mission' not found.");
}

function missionAccepted() {
  console.log("Mission has been accepted.");
}
