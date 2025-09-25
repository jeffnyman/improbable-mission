import { checkBrowserCapabilities } from "./checkBrowser";
import { loadGameResources } from "./loadResources";
import { GameAudio } from "./audio";
import * as Constants from "./constants";

export class Engine {
  constructor() {
    console.log("[ENGINE] Construct: Engine");

    this.test = false; // REMOVE

    this.loadedResources = 0;
    this.requiredResources = 1;

    this.audio = new GameAudio();
  }

  async init() {
    console.log("[ENGINE] Initialize: Engine");

    // Redirect to the landing page if the URL has a query string.
    if (document.location.search) {
      window.history.pushState({}, "", "/");
    }

    checkBrowserCapabilities();

    this.audio.init(this);

    const requiredElement = document.getElementById("required-resources");
    requiredElement.textContent = this.requiredResources;

    try {
      this.setupToolbar();
      this.setupKeyHandling();
      this.setupOptions();

      console.log(this.test); // REMOVE
      await loadGameResources(this);
      console.log(this.test); // REMOVE
    } catch (error) {
      console.error("Initialization failed:", error);
      return;
    }
  }

  setupOptions() {
    console.log("[ENGINE] Setup: Options");

    if (localStorage.getItem("palette") === null) {
      localStorage.setItem("palette", "vice");
    }

    Constants.options.palette = localStorage.getItem("palette");

    const paletteButton = document.querySelector(
      `.palette[data-palette="${Constants.options.palette}"]`,
    );

    if (paletteButton) {
      paletteButton.click();
    }

    if (!this.audio.context) {
      localStorage.setItem("sound", "off");
    }

    if (localStorage.getItem("sound") === null) {
      localStorage.setItem("sound", "on");
    }

    Constants.options.sound = localStorage.getItem("sound");

    const soundButton = document.querySelector(
      `.setting-sound-${Constants.options.sound}`,
    );

    if (soundButton) {
      soundButton.click();
    }
  }

  setupKeyHandling() {
    console.log("[ENGINE] Setup: Key handling");

    document.addEventListener("keydown", (evt) => {
      var overlay = document.getElementById("overlay");

      if (evt.code === "Escape" && !overlay.classList.contains("hidden")) {
        overlay.click();
      }
    });
  }

  setupToolbar() {
    console.log("[ENGINE] Setup: Toolbar");

    const dossierButton = document.getElementById("dossier-button");

    if (dossierButton) {
      dossierButton.addEventListener("click", () => {
        document.getElementById("overlay")?.classList.remove("hidden");
        document.getElementById("dossier")?.classList.remove("hidden");
      });
    }

    const overlay = document.getElementById("overlay");

    if (overlay) {
      overlay.addEventListener("click", () => {
        document.getElementById("overlay")?.classList.add("hidden");
        document.getElementById("dossier")?.classList.add("hidden");
      });
    }

    const paletteButtons = document.querySelectorAll(".palette");

    paletteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const pal = button.getAttribute("data-palette");

        Constants.options.palette = pal;
        localStorage.setItem("palette", pal);

        this.setActiveButton(button);
      });
    });

    const soundOnButton = document.querySelector(".setting-sound-on");
    const soundOffButton = document.querySelector(".setting-sound-off");

    soundOnButton?.addEventListener("click", () => {
      if (this.audio.context) {
        Constants.options.sound = "on";
        localStorage.setItem("sound", "on");
        this.setActiveButton(soundOnButton);
      }
    });

    soundOffButton?.addEventListener("click", () => {
      if (this.audio.context) {
        Constants.options.sound = "off";
        localStorage.setItem("sound", "off");
        this.setActiveButton(soundOffButton);
      }
    });
  }

  setActiveButton(button) {
    const item = button.closest(".item");

    if (item) {
      const allButtons = item.querySelectorAll(".clickable");
      allButtons.forEach((btn) => btn.classList.remove("active"));
    }

    button.classList.add("active");
  }
}
