import { checkBrowserCapabilities } from "./checkBrowser";

export class Engine {
  constructor() {
    console.log("[ENGINE] Construct: Engine");
  }

  init() {
    console.log("[ENGINE] Initialize: Engine");

    // Redirect to the landing page if the URL has a query string.
    if (document.location.search) {
      window.history.pushState({}, "", "/");
    }

    checkBrowserCapabilities();

    try {
      this.setupToolbar();
    } catch (error) {
      console.error("Initialization failed:", error);
      return;
    }
  }

  setupToolbar() {
    console.log("[ENGINE] Setup: Toolbar");

    const dossierButton = document.getElementById("dossier-button");

    if (dossierButton) {
      dossierButton.addEventListener("click", () => {
        document.getElementById("overlay")?.classList.remove("hidden");
        document.getElementById("dossier")?.classList.remove("hidden");
      });
    }

    const overlay = document.getElementById("overlay");

    if (overlay) {
      overlay.addEventListener("click", () => {
        document.getElementById("overlay")?.classList.add("hidden");
        document.getElementById("dossier")?.classList.add("hidden");
      });
    }
  }
}
