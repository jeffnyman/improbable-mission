import { checkBrowserCapabilities } from "./checkBrowser";
import * as Constants from "./constants";

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
      this.setupKeyHandling();
      this.setupOptions();
    } catch (error) {
      console.error("Initialization failed:", error);
      return;
    }
  }

  setupOptions() {
    console.log("[ENGINE] Setup: Options");

    if (localStorage.getItem("palette") === null) {
      localStorage.setItem("palette", "vice");
    }

    Constants.options.palette = localStorage.getItem("palette");

    const paletteButton = document.querySelector(
      `.palette[data-palette="${Constants.options.palette}"]`,
    );

    if (paletteButton) {
      paletteButton.click();
    }
  }

  setupKeyHandling() {
    console.log("[ENGINE] Setup: Key handling");

    document.addEventListener("keydown", (evt) => {
      var overlay = document.getElementById("overlay");

      if (evt.code === "Escape" && !overlay.classList.contains("hidden")) {
        overlay.click();
      }
    });
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
