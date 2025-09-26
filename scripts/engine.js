import { checkBrowserCapabilities } from "./checkBrowser";
import { loadGameResources } from "./loadResources";
import { GameAudio } from "./audio";
import { Game } from "./game";
import * as Constants from "./constants";

export class Engine {
  constructor() {
    console.log("[ENGINE] Construct: Engine");

    this.loadedResources = 0;
    this.requiredResources = 1;

    // Sprite management
    this.spriteWidth = 800;
    this.spriteHeight = 600;
    this.baseSprites = null;
    this.baseSpriteCanvas = null;
    this.baseSpriteContext = null;
    this.baseSpriteData = null;
    this.baseSpriteDataPix = null;
    this.baseSpriteImageDataCreated = null;

    this.audio = new GameAudio();
    this.game = new Game();
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

      await loadGameResources(this);

      this.setupSpriteProcessing();
      this.setupInterface();
      this.generateGame();
    } catch (error) {
      console.error("Initialization failed:", error);
      return;
    }
  }

  generateGame() {
    console.log("[ENGINE] Generate: Game");

    this.game.init();
  }

  setupSpriteProcessing() {
    this.baseSpriteCanvas = document.createElement("canvas");
    this.baseSpriteCanvas.width = this.spriteWidth;
    this.baseSpriteCanvas.height = this.spriteHeight;

    this.baseSpriteContext = this.baseSpriteCanvas.getContext("2d");
    this.baseSpriteContext.drawImage(this.baseSprites, 0, 0);

    this.baseSpriteData = this.baseSpriteContext.getImageData(
      0,
      0,
      this.spriteWidth,
      this.spriteHeight,
    );

    this.baseSpriteDataPix = this.baseSpriteData.data;

    this.baseSpriteImageDataCreated = this.baseSpriteContext.createImageData(
      this.spriteWidth,
      this.spriteHeight,
    );

    this.swapSpritePalette("vice", Constants.palette.vice);
    this.swapSpritePalette("c64s", Constants.palette.c64s);
    this.swapSpritePalette("c64hq", Constants.palette.c64hq);
    this.swapSpritePalette("ccs64", Constants.palette.ccs64);
    this.swapSpritePalette("pc64", Constants.palette.pc64);
  }

  setupInterface() {
    console.log("[ENGINE] Setup: Interface");

    const loadingDiv = document.getElementById("loading");
    const toolBarDiv = document.getElementById("toolbar");
    const gameDiv = document.getElementById("game");

    loadingDiv.classList.add("hidden");
    toolBarDiv.classList.remove("hidden");
    gameDiv.classList.remove("hidden");
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

  swapSpritePalette(name, targetPalette) {
    var newImageData = this.baseSpriteImageDataCreated;

    for (
      var pixelIndex = 0, totalPixels = this.baseSpriteDataPix.length;
      pixelIndex < totalPixels;
      pixelIndex += 4
    ) {
      var currentRed = this.baseSpriteDataPix[pixelIndex];
      var currentGreen = this.baseSpriteDataPix[pixelIndex + 1];
      var currentBlue = this.baseSpriteDataPix[pixelIndex + 2];

      for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
        var sourceColor = Constants.palette.sprite[colorIndex];
        var sourceRed = parseInt(sourceColor[0] + sourceColor[1], 16);
        var sourceGreen = parseInt(sourceColor[2] + sourceColor[3], 16);
        var sourceBlue = parseInt(sourceColor[4] + sourceColor[5], 16);

        if (
          currentRed == sourceRed &&
          currentGreen == sourceGreen &&
          currentBlue == sourceBlue
        ) {
          var targetColor = targetPalette[colorIndex];

          newImageData.data[pixelIndex] = parseInt(
            targetColor[0] + targetColor[1],
            16,
          );

          newImageData.data[pixelIndex + 1] = parseInt(
            targetColor[2] + targetColor[3],
            16,
          );

          newImageData.data[pixelIndex + 2] = parseInt(
            targetColor[4] + targetColor[5],
            16,
          );

          newImageData.data[pixelIndex + 3] =
            this.baseSpriteDataPix[pixelIndex + 3];

          break;
        }
      }
    }

    var outputCanvas = document.createElement("canvas");
    outputCanvas.width = this.spriteWidth;
    outputCanvas.height = this.spriteHeight;

    var outputContext = outputCanvas.getContext("2d");
    outputContext.putImageData(newImageData, 0, 0);

    Constants.sprites[name] = new Image();
    Constants.sprites[name].src = outputCanvas.toDataURL("image/png");
  }
}
