import { checkBrowser } from "./checkBrowser";

export class Engine {
  init() {
    checkBrowser();

    this.setupInterface();
  }

  setupInterface() {
    document.getElementById("toolbar").classList.remove("hidden");
  }
}
