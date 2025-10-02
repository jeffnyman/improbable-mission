import { checkBrowser } from "./checkBrowser";
import { loadResources } from "./loadResources";
import { GameAudio } from "./audio";

export class Engine {
  constructor() {
    // Sprite management
    this.gameSprites = null;
    this.spriteWidth = 800;
    this.spriteHeight = 600;
    this.baseSpriteCanvas = null;
    this.baseSpriteContext = null;
    this.baseSpriteData = null;
    this.baseSpritePixels = null;
    this.outputSpriteData = null;

    // Subsystems
    this.audio = new GameAudio();
  }

  async init() {
    this.audio.init();

    checkBrowser();
    await loadResources(this);

    this.setupSpriteProcessing();
    this.setupInterface();
    this.setupToolbar();
    this.setupKeyHandling();
  }

  setupSpriteProcessing() {
    this.baseSpriteCanvas = document.createElement("canvas");
    this.baseSpriteCanvas.width = this.spriteWidth;
    this.baseSpriteCanvas.height = this.spriteHeight;

    this.baseSpriteContext = this.baseSpriteCanvas.getContext("2d");
    this.baseSpriteContext.drawImage(this.gameSprites, 0, 0);

    this.baseSpriteData = this.baseSpriteContext.getImageData(
      0,
      0,
      this.spriteWidth,
      this.spriteHeight,
    );

    this.baseSpritePixels = this.baseSpriteData.data;

    this.outputSpriteData = this.baseSpriteContext.createImageData(
      this.spriteWidth,
      this.spriteHeight,
    );
  }

  setupInterface() {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("toolbar").classList.remove("hidden");

    document.getElementById("overlay").addEventListener("click", () => {
      document.getElementById("overlay").classList.add("hidden");
      document.getElementById("dossier").classList.add("hidden");
    });
  }

  setupToolbar() {
    document.getElementById("dossier-button").addEventListener("click", () => {
      document.getElementById("overlay").classList.remove("hidden");
      document.getElementById("dossier").classList.remove("hidden");
    });
  }

  setupKeyHandling() {
    document.addEventListener("keydown", (evt) => {
      var overlay = document.getElementById("overlay");

      if (evt.code === "Escape" && !overlay.classList.contains("hidden")) {
        overlay.click();
      }
    });
  }
}
