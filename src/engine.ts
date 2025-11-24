import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { sprites } from "./components/sprites";
import { CanvasResizer } from "./ui/canvasResizer";

export class Engine {
  async init() {
    await sprites.loadSprites();

    graphics.init("game");

    browser.requireElement("app").classList.remove("hidden");

    new CanvasResizer().init();
  }
}
