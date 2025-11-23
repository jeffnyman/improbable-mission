import { browser } from "./utils/browser";
import { sprites } from "./components/sprites";

export class Engine {
  init() {
    sprites.loadSprites();

    browser.requireElement("app").classList.remove("hidden");
  }
}
