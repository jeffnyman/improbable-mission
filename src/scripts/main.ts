import "../styles/mission.css";

let game: string = "Improbable Mission";

console.log(`... ${game} ...`);
console.log("Browser ready; mission provided.");

const acceptMissionSpan =
  document.querySelector<HTMLSpanElement>("#accept-mission");

acceptMissionSpan.addEventListener("click", () => missionAccepted());

function missionAccepted() {
  console.log("Mission has been accepted.");
}
