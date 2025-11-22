import agentThwartedImg from "/images/agent-thwarted.png";

class Browser {
  showError(message: string, listItems?: string[]) {
    document.body.style.backgroundColor = "hsl(34deg 44% 68%)";

    const errorDiv = document.createElement("div");
    errorDiv.className = "aborted-wrapper";

    const abortedBgShimmer = document.createElement("div");
    abortedBgShimmer.className = "aborted-bg-shimmer";

    const abortedBg = document.createElement("img");
    abortedBg.className = "aborted-bg";
    abortedBg.src = agentThwartedImg;
    abortedBg.width = 1022;
    abortedBg.height = 412;
    abortedBg.alt = "Mission Aborted!";

    const abortedText = document.createElement("div");
    abortedText.className = "aborted-text";

    const header = document.createElement("p");
    header.textContent = "Mission Aborted!";

    const messageEl = document.createElement("p");
    messageEl.textContent = message;

    abortedText.appendChild(header);
    abortedText.appendChild(messageEl);

    if (listItems && listItems.length > 0) {
      const list = document.createElement("ul");

      listItems.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });

      abortedText.appendChild(list);
    }

    errorDiv.appendChild(abortedBgShimmer);
    errorDiv.appendChild(abortedBg);
    errorDiv.appendChild(abortedText);

    document.body.appendChild(errorDiv);
  }

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
      this.showError(
        "Mission stopped due to following reasons:",
        unsupportedReasons,
      );
      throw new Error("Mission aborted! Browser capabilities check failed.");
    }
  }
}

export const browser: Browser = new Browser();
