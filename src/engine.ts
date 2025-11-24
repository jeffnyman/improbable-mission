import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { sprites } from "./components/sprites";

export class Engine {
  init() {
    sprites.loadSprites();

    graphics.init("game");

    browser.requireElement("app").classList.remove("hidden");
  }
}
