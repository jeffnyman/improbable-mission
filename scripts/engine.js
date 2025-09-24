import { checkBrowserCapabilities } from "./checkBrowser";

export class Engine {
  constructor() {
    console.log("[ENGINE] Construct: Engine");
  }

  init() {
    console.log("[ENGINE] Initialize: Engine");

    // Redirect to the landing page if the URL has a query string.
    if (document.location.search) {
      window.history.pushState({}, "", "/");
    }

    checkBrowserCapabilities();
  }
}
