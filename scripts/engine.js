import { checkBrowser } from "./checkBrowser";
import { loadResources } from "./loadResources";
import { GameAudio } from "./audio";
import { palette } from "./palette";

export class Engine {
  constructor() {
    // Sprite management
    this.gameSprites = null;
    this.sprites = {};
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

    Object.entries(palette).forEach(([name, colors]) => {
      if (name !== "source") {
        this.swapSpritePalette(name, colors);
      }
    });
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

  swapSpritePalette(name, targetPalette) {
    var newImageData = this.outputSpriteData;

    for (
      var pixelIndex = 0, totalPixels = this.baseSpritePixels.length;
      pixelIndex < totalPixels;
      pixelIndex += 4
    ) {
      var currentRed = this.baseSpritePixels[pixelIndex];
      var currentGreen = this.baseSpritePixels[pixelIndex + 1];
      var currentBlue = this.baseSpritePixels[pixelIndex + 2];

      for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
        var sourceColor = palette.source[colorIndex];
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
            this.baseSpritePixels[pixelIndex + 3];

          break;
        }
      }
    }

    var outputCanvas = document.createElement("canvas");
    outputCanvas.width = this.spriteWidth;
    outputCanvas.height = this.spriteHeight;

    var outputContext = outputCanvas.getContext("2d");
    outputContext.putImageData(newImageData, 0, 0);

    this.sprites[name] = new Image();
    this.sprites[name].src = outputCanvas.toDataURL("image/png");
  }
}
