import { browser } from "../utils/browser";

class FullScreenSelector {
  init() {
    this.setupScreenOptions();
  }

  private setupScreenOptions() {
    browser.requireElement("fullscreen").addEventListener("click", () => {
      if (document.fullscreenElement) {
        this.fullScreenExit();
      } else {
        this.fullScreenEnter();
      }
    });
  }

  private fullScreenEnter() {
    const gameDiv = browser.requireElement("game");
    if (gameDiv.requestFullscreen) gameDiv.requestFullscreen();
  }

  fullScreenExit() {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

export const fullScreenSelector: FullScreenSelector = new FullScreenSelector();
