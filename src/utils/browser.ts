class Browser {
  requireElement<T extends HTMLElement = HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    const errorMessage = `Required element #${id} not found in DOM`;

    if (!el) {
      this.showAborted(errorMessage);
      throw new Error(errorMessage);
    }

    return el as T;
  }

  showAborted(message: string, listItems?: string[]) {
    this.requireElement("app").classList.add("hidden");

    const abortedDiv = document.createElement("div");
    abortedDiv.className = "aborted-wrapper";

    const abortedBg = document.createElement("img");
    abortedBg.className = "aborted-bg";

    abortedBg.onload = () => {
      abortedDiv.appendChild(abortedBg);
    };

    abortedBg.onerror = () => {
      // Image never enters the DOM.
    };

    abortedBg.src = `${import.meta.env.BASE_URL}images/agent-thwarted.png`;
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

    abortedDiv.appendChild(abortedText);
    document.body.appendChild(abortedDiv);
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
      this.showAborted(
        "Mission stopped due to following reasons:",
        unsupportedReasons,
      );
      throw new Error("Browser capabilities check failed.");
    }
  }
}

export const browser: Browser = new Browser();
