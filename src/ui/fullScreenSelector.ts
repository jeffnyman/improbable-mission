import { browser } from "../utils/browser";

export class FullScreenSelector {
  init() {
    this.setupScreenOptions();
  }

  setupScreenOptions() {
    browser.requireElement("fullscreen").addEventListener("click", () => {
      if (document.fullscreenElement) {
        this.fullScreenExit();
      } else {
        this.fullScreenEnter();
      }
    });
  }

  fullScreenEnter() {
    const gameDiv = browser.requireElement("game");
    if (gameDiv.requestFullscreen) gameDiv.requestFullscreen();
  }

  fullScreenExit() {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}
