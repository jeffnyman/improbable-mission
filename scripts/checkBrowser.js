export function checkBrowser() {
  const unsupportedReasons = [];

  if (
    /MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
    /Trident\/(\d+\.\d+);/.test(navigator.userAgent)
  ) {
    unsupportedReasons.push("Internet Explorer is not supported.");
  }

  if (typeof Storage === "undefined") {
    unsupportedReasons.push("Local storage is not supported.");
  }

  var testCanvas = document.createElement("canvas");

  if (!(testCanvas.getContext && testCanvas.getContext("2d"))) {
    unsupportedReasons.push("Canvas support is not available.");
  } else {
    testCanvas.remove();
  }

  if (!window.requestAnimationFrame) {
    unsupportedReasons.push("Animation scheduling is not supported.");
  }

  if (unsupportedReasons.length > 0) {
    displayUnsupportedReasons(unsupportedReasons);
    throw new Error("Browser capabilities check failed.");
  }
}

function displayUnsupportedReasons(reasons) {
  document.getElementById("app").classList.add("hidden");

  const unsupportedDiv = document.getElementById("unsupported");
  const unsupportedList = unsupportedDiv.querySelector("ul");

  unsupportedList.innerHTML = reasons
    .map((reason) => `<li>${reason}</li>`)
    .join("");

  unsupportedDiv.classList.remove("hidden");
}
