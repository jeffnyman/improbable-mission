class Browser {
  check() {
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
      throw new Error("Browser capabilities check failed.");
    }
  }
}

export const browser: Browser = new Browser();
