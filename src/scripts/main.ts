import "../styles/mission.css";
import { App } from "./app";

console.log("... Improbable Mission ...");
console.log("Browser ready; mission provided.");

const acceptMissionSpan =
  document.querySelector<HTMLSpanElement>("#accept-mission")!;

acceptMissionSpan.addEventListener("click", () => missionAccepted());

function missionAccepted() {
  console.log("Mission has been accepted.");

  const missionDiv = document.querySelector<HTMLDivElement>("#mission")!;
  missionDiv.remove();

  const footerDiv = document.querySelector<HTMLDivElement>("#footer")!;
  footerDiv.remove();

  const appDiv = document.querySelector<HTMLDivElement>("#app")!;
  appDiv.classList.remove("hidden");

  appDiv.innerHTML = `
    <div id="loading" class="loading">
      <p>
        Loading Resources<br>0 / 0
      </p>
    </div>

    <div id="unsupported" class="unsupported hidden">
      <h2>Unsupported Browser</h2>

      <p>Your browser is not supported for the following reasons:</p>

      <ul></ul>
    </div>
  `;

  new App();
}
