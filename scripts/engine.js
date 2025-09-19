import { checkBrowserCapabilities } from "./browserCheck";

export class Engine {
  constructor() {
    console.log("Engine Constructed");
  }

  init() {
    try {
      // Redirect to the landing page if the URL has a query string.
      if (document.location.search !== "") {
        window.history.pushState(false, false, "/");
      }

      checkBrowserCapabilities();
    } catch (error) {
      console.error("Initialization failed:", error);
      return;
    }
  }
}
