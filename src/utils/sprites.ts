import { browser } from "./browser";
import { graphics } from "./graphics";
import { palette } from "../data/palette";

class Sprites {
  private spriteSheet: HTMLImageElement | null = null;
  private gameSprites: Record<string, HTMLImageElement> = {};
  private baseSpriteCanvas: HTMLCanvasElement | null = null;
  private baseSpritePixels: Uint8ClampedArray | null = null;
  private outputSpriteData: ImageData | null = null;

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

    this.baseSpriteCanvas = document.createElement("canvas");
    this.baseSpriteCanvas.width = this.spriteSheet.naturalWidth;
    this.baseSpriteCanvas.height = this.spriteSheet.naturalHeight;

    const baseSpriteContext = graphics.getRenderingContext2D(
      this.baseSpriteCanvas,
    );
    baseSpriteContext.drawImage(this.spriteSheet, 0, 0);

    const baseSpriteData = baseSpriteContext.getImageData(
      0,
      0,
      this.baseSpriteCanvas.width,
      this.baseSpriteCanvas.height,
    );

    this.baseSpritePixels = baseSpriteData.data;

    this.outputSpriteData = baseSpriteContext.createImageData(
      this.baseSpriteCanvas.width,
      this.baseSpriteCanvas.height,
    );

    Object.entries(palette).forEach(([name, colors]) => {
      this.generatePalettedSprite(name, colors);
    });
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

  private generatePalettedSprite(name: string, targetPalette: string[]) {
    if (
      !this.baseSpriteCanvas ||
      !this.baseSpritePixels ||
      !this.outputSpriteData
    ) {
      browser.showAborted("Sprite data is not initialized.");
      throw new Error(
        "Sprite data not initialized; call initializeSprites() first.",
      );
    }

    const newImageData = this.outputSpriteData;

    // Iterate through every pixel in the sprite sheet data.
    // (RGBA = 4 bytes per pixel)
    for (
      let pixel = 0, totalPixels = this.baseSpritePixels.length;
      pixel < totalPixels;
      pixel += 4
    ) {
      // Extract RGB components of current pixel.
      const currentRed = this.baseSpritePixels[pixel];
      const currentGreen = this.baseSpritePixels[pixel + 1];
      const currentBlue = this.baseSpritePixels[pixel + 2];

      // Search through the 16-color source palette to find a match.
      for (let color = 0; color < 16; color++) {
        const sourceColor = palette.source[color];
        const sourceRed = parseInt(sourceColor[0] + sourceColor[1], 16);
        const sourceGreen = parseInt(sourceColor[2] + sourceColor[3], 16);
        const sourceBlue = parseInt(sourceColor[4] + sourceColor[5], 16);

        // Check if current pixel matches the palette color.
        if (
          currentRed === sourceRed &&
          currentGreen === sourceGreen &&
          currentBlue === sourceBlue
        ) {
          // Replace current pixel with the corresponding color
          // from the target palette.
          const targetColor = targetPalette[color];

          newImageData.data[pixel] = parseInt(
            targetColor[0] + targetColor[1],
            16,
          );

          newImageData.data[pixel + 1] = parseInt(
            targetColor[2] + targetColor[3],
            16,
          );

          newImageData.data[pixel + 2] = parseInt(
            targetColor[4] + targetColor[5],
            16,
          );

          // Preserve the original alpha (transparency) status.
          newImageData.data[pixel + 3] = this.baseSpritePixels[pixel + 3];

          break;
        }
      }
    }

    // Create a new canvas and draw the recolored sprite data.
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = this.baseSpriteCanvas.width;
    outputCanvas.height = this.baseSpriteCanvas.height;

    const outputContext = graphics.getRenderingContext2D(outputCanvas);
    outputContext.putImageData(newImageData, 0, 0);

    this.gameSprites[name] = new Image();
    this.gameSprites[name].src = outputCanvas.toDataURL("image/png");
  }
}

export const sprites: Sprites = new Sprites();
