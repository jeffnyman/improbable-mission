import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";

class Engine {
  init() {
    browser.requireElement("app").classList.remove("hidden");

    graphics.init("game");
  }
}

export const engine: Engine = new Engine();
