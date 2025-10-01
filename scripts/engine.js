import { checkBrowser } from "./checkBrowser";

export class Engine {
  init() {
    checkBrowser();

    this.setupInterface();
    this.setupToolbar();
  }

  setupInterface() {
    document.getElementById("toolbar").classList.remove("hidden");
  }

  setupToolbar() {
    document.getElementById("dossier-button").addEventListener("click", () => {
      document.getElementById("dossier").classList.remove("hidden");
    });
  }
}
