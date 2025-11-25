import { browser } from "../utils/browser";
import { graphics } from "../utils/graphics";
import { palette } from "../data/palette";

class Sprites {
  private spriteSheet: HTMLImageElement | null = null;
  private gameSprites: Record<string, HTMLImageElement> = {};
  private baseSpritePixels: Uint8ClampedArray | null = null;
  private outputSpriteData: ImageData | null = null;
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

    this.baseSpritePixels = baseSpriteData.data;

    this.outputSpriteData = baseSpriteContext.createImageData(
      this.spriteWidth,
      this.spriteHeight,
    );

    Object.entries(palette).forEach(([name, colors]) => {
      this.generatePalettedSprite(name, colors);
    });
  }

  generatePalettedSprite(name: string, targetPalette: string[]) {
    if (!this.baseSpritePixels || !this.outputSpriteData) {
      browser.showError("Sprite data is not initialized.");
      throw new Error("Sprite data is not initialized.");
    }

    const newImageData = this.outputSpriteData;

    // Iterate through every pixel in the sprite sheet
    // (RGBA = 4 bytes per pixel)
    for (
      let pixelIndex = 0, totalPixels = this.baseSpritePixels.length;
      pixelIndex < totalPixels;
      pixelIndex += 4
    ) {
      // Extract RGB components of current pixel.
      const currentRed = this.baseSpritePixels[pixelIndex];
      const currentGreen = this.baseSpritePixels[pixelIndex + 1];
      const currentBlue = this.baseSpritePixels[pixelIndex + 2];

      // Search through the 16-color source palette to find a match.
      for (let colorIndex = 0; colorIndex < 16; colorIndex++) {
        const sourceColor = palette.source[colorIndex];
        const sourceRed = parseInt(sourceColor[0] + sourceColor[1], 16);
        const sourceGreen = parseInt(sourceColor[2] + sourceColor[3], 16);
        const sourceBlue = parseInt(sourceColor[4] + sourceColor[5], 16);

        // Check if current pixel matches this palette color.
        if (
          currentRed === sourceRed &&
          currentGreen === sourceGreen &&
          currentBlue === sourceBlue
        ) {
          // Replace current pixel with the corresponding color from the
          // target palette.
          const targetColor = targetPalette[colorIndex];

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

          // Preserve the original alpha (transparency) value.
          newImageData.data[pixelIndex + 3] =
            this.baseSpritePixels[pixelIndex + 3];

          break;
        }
      }
    }

    // Create a new canvas and draw the recolored sprite data.
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = this.spriteWidth;
    outputCanvas.height = this.spriteHeight;

    const outputContext = graphics.getRenderingContext2D(outputCanvas);
    outputContext.putImageData(newImageData, 0, 0);

    this.gameSprites[name] = new Image();
    this.gameSprites[name].src = outputCanvas.toDataURL("image/png");
  }
}

export const sprites: Sprites = new Sprites();
