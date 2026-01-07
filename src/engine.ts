import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { canvasResizer } from "./ui/canvasResizer";

class Engine {
  init() {
    browser.requireElement("app").classList.remove("hidden");

    graphics.init("game");
    canvasResizer.init();
  }
}

export const engine: Engine = new Engine();
