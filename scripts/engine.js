export class Engine {
  constructor() {
    console.log("Engine Constructed");
  }

  init() {
    console.log("Engine Initialized");

    try {
      // Redirect to the landing page if the URL has a query string.
      if (document.location.search !== "") {
        window.history.pushState(false, false, "/");
      }
    } catch (error) {
      console.error("Initialization failed:", error);
      return;
    }
  }
}
