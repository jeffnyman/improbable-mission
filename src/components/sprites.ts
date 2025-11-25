import { browser } from "../utils/browser";
import { graphics } from "../utils/graphics";

class Sprites {
  private spriteSheet: HTMLImageElement | null = null;
  private gameSprites: Record<string, HTMLImageElement> = {};
  private spriteWidth = 0;
  private spriteHeight = 0;

  async loadSprites() {
    return new Promise<void>((resolve, reject) => {
      const spriteSheet = new Image();

      spriteSheet.onload = () => {
        this.spriteSheet = spriteSheet;
        resolve();
      };

      spriteSheet.onerror = () => {
        browser.showError("Unable to load sprite sheet.");
        reject(new Error("Unable to load sprite sheet."));
      };

      spriteSheet.src = `${import.meta.env.BASE_URL}images/sprites.png`;
    });
  }

  getGameSprites() {
    return this.gameSprites;
  }

  initializeSprites() {
    if (!this.spriteSheet) {
      browser.showError("Sprite sheet not loaded.");
      throw new Error("Sprite sheet not loaded.");
    }

    this.spriteWidth = this.spriteSheet.naturalWidth;
    this.spriteHeight = this.spriteSheet.naturalHeight;

    const baseSpriteCanvas = document.createElement("canvas");
    baseSpriteCanvas.width = this.spriteWidth;
    baseSpriteCanvas.height = this.spriteHeight;

    const baseSpriteContext = graphics.getRenderingContext2D(baseSpriteCanvas);
    baseSpriteContext.drawImage(this.spriteSheet, 0, 0);

    const baseSpriteData = baseSpriteContext.getImageData(
      0,
      0,
      this.spriteWidth,
      this.spriteHeight,
    );

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = this.spriteWidth;
    outputCanvas.height = this.spriteHeight;

    const outputContext = graphics.getRenderingContext2D(outputCanvas);
    outputContext.putImageData(baseSpriteData, 0, 0);

    this.gameSprites["source"] = new Image();
    this.gameSprites["source"].src = outputCanvas.toDataURL("image/png");
  }
}

export const sprites: Sprites = new Sprites();
