import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { canvasResizer } from "./ui/canvasResizer";
import { sprites } from "./utils/sprites";

class Engine {
  init() {
    browser.requireElement("app").classList.remove("hidden");

    sprites.loadSprites();
    graphics.init("game");
    canvasResizer.init();
  }
}

export const engine: Engine = new Engine();
