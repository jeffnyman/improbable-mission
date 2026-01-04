import { browser } from "./utils/browser";

class Engine {
  init() {
    browser.requireElement("app").classList.remove("hidden");
  }
}

export const engine: Engine = new Engine();
