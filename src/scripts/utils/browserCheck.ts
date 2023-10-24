export function checkBrowserCapabilities() {
  const unsupportedReasons: string[] = [];

  // This game will not work well in Internet Explorer all that well
  // but it will work in Edge. So the test here is specific to MSIE
  // as well as Trident, the latter of which covers IE 10 and 11.
  if (
    /MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
    /Trident\/(\d+\.\d+);/.test(navigator.userAgent)
  ) {
    unsupportedReasons.push("Internet Explorer is not supported.");
  }

  // Some of the game configuration, which can be set by the player,
  // will be stored so having local storage available is necessary.
  if (typeof Storage === "undefined") {
    unsupportedReasons.push("Local storage is not supported.");
  }

  // The game displays all elements on canvas elements so if canvas
  // creation is not possible, there's not much game to be had here.
  var testCanvas = document.createElement("canvas");

  if (!(testCanvas.getContext && testCanvas.getContext("2d"))) {
    unsupportedReasons.push("Canvas support is not available.");
  } else {
    testCanvas.remove();
  }

  // Animation is a heavy part of the game so scheduling an animation
  // must be possible.
  if (!window.requestAnimationFrame) {
    unsupportedReasons.push("Animation scheduling is not supported.");
  }

  // If there are problems, they need to be shown.
  if (unsupportedReasons.length > 0) {
    displayUnsupported(unsupportedReasons);
    throw new Error("Browser capabilities check failed.");
  }
}

function displayUnsupported(reasons: string[]) {
  const loadingDiv = document.querySelector<HTMLDivElement>("#loading")!;
  const unsupportedDiv =
    document.querySelector<HTMLDivElement>("#unsupported")!;
  const unsupportedList = unsupportedDiv.querySelector<HTMLUListElement>("ul")!;

  unsupportedList.innerHTML = reasons
    .map((reason) => `<li>${reason}</li>`)
    .join("");

  unsupportedDiv.classList.remove("hidden");
  loadingDiv.classList.add("hidden");
}
