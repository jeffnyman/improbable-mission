import { checkBrowser } from "./checkBrowser";

export class Engine {
  init() {
    checkBrowser();

    this.setupInterface();
    this.setupToolbar();
    this.setupKeyHandling();
  }

  setupInterface() {
    document.getElementById("toolbar").classList.remove("hidden");

    document.getElementById("overlay").addEventListener("click", () => {
      document.getElementById("overlay").classList.add("hidden");
      document.getElementById("dossier").classList.add("hidden");
    });
  }

  setupToolbar() {
    document.getElementById("dossier-button").addEventListener("click", () => {
      document.getElementById("overlay").classList.remove("hidden");
      document.getElementById("dossier").classList.remove("hidden");
    });
  }

  setupKeyHandling() {
    document.addEventListener("keydown", (evt) => {
      var overlay = document.getElementById("overlay");

      if (evt.code === "Escape" && !overlay.classList.contains("hidden")) {
        overlay.click();
      }
    });
  }
}
