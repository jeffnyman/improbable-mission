export function checkBrowser() {
  const unsupportedReasons = [];

  if (/MSIE|Trident/.test(navigator.userAgent)) {
    unsupportedReasons.push("Internet Explorer is not supported.");
  }

  if (typeof Storage === "undefined") {
    unsupportedReasons.push("Local storage is not available.");
  }

  const testCanvas = document.createElement("canvas");
  const hasCanvas = !!(testCanvas.getContext && testCanvas.getContext("2d"));

  if (!hasCanvas) {
    unsupportedReasons.push("Canvas rendering is not available.");
  }

  if (!window.requestAnimationFrame) {
    unsupportedReasons.push("Animation scheduling is not available.");
  }

  if (unsupportedReasons.length > 0) {
    displayUnsupportedReasons(unsupportedReasons);
    throw new Error("Mission aborted! Browser capabilities check failed.");
  }
}

function displayUnsupportedReasons(reasons: string[]) {
  const unsupportedDiv = document.getElementById("unsupported");
  const unsupportedList = unsupportedDiv?.querySelector("ul");

  if (!unsupportedDiv || !unsupportedList) {
    console.warn("Unable to display unsupported browser reasons.");
    return;
  }

  unsupportedList.innerHTML = reasons
    .map((reason) => `<li>${reason}</li>`)
    .join("");

  unsupportedDiv.classList.remove("hidden");
}
