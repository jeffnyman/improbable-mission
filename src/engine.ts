import { browser } from "./utils/browser";

export class Engine {
  init() {
    browser.requireElement("app").classList.remove("hidden");
  }
}
