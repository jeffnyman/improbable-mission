import { browser } from "./browser";
import { graphics } from "./graphics";

class Sprites {
  private spriteSheet: HTMLImageElement | null = null;
  private gameSprites: Record<string, HTMLImageElement> = {};

  getSpriteSheet(): HTMLImageElement {
    if (!this.spriteSheet) {
      browser.showAborted("Unable to use game sprite sheet.");
      throw new Error("Sprite sheet not loaded. Call loadSprites() first.");
    }

    return this.spriteSheet;
  }

  getGameSprites(): Record<string, HTMLImageElement> {
    return this.gameSprites;
  }

  initializeSprites() {
    if (!this.spriteSheet) {
      browser.showAborted("Unable to use game sprite sheet.");
      throw new Error("Sprite sheet not loaded. Call loadSprites() first.");
    }

    const baseSpriteCanvas = document.createElement("canvas");
    baseSpriteCanvas.width = this.spriteSheet.naturalWidth;
    baseSpriteCanvas.height = this.spriteSheet.naturalHeight;

    const baseSpriteContext = graphics.getRenderingContext2D(baseSpriteCanvas);
    baseSpriteContext.drawImage(this.spriteSheet, 0, 0);

    const baseSpriteData = baseSpriteContext.getImageData(
      0,
      0,
      baseSpriteCanvas.width,
      baseSpriteCanvas.height,
    );

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = baseSpriteCanvas.width;
    outputCanvas.height = baseSpriteCanvas.height;

    const outputContext = graphics.getRenderingContext2D(outputCanvas);
    outputContext.putImageData(baseSpriteData, 0, 0);

    this.gameSprites["source"] = new Image();
    this.gameSprites["source"].src = outputCanvas.toDataURL("image/png");
  }

  async loadSprites() {
    return new Promise<void>((resolve, reject) => {
      const spriteSheet = new Image();

      spriteSheet.onload = () => {
        this.spriteSheet = spriteSheet;
        resolve();
      };

      spriteSheet.onerror = () => {
        browser.showAborted("Unable to load sprite sheet.");
        reject(new Error("Unable to load sprite sheet."));
      };

      spriteSheet.src = `${import.meta.env.BASE_URL}images/sprites.png`;
    });
  }
}

export const sprites: Sprites = new Sprites();
