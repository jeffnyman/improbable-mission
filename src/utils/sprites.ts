import { browser } from "./browser";
import { graphics } from "./graphics";
import { palette } from "../data/palette";

class Sprites {
  private spriteSheet: HTMLImageElement | null = null;
  private gameSprites: Record<string, HTMLImageElement> = {};
  private baseSpriteCanvas: HTMLCanvasElement | null = null;
  private baseSpritePixels: Uint8ClampedArray | null = null;
  private outputSpriteData: ImageData | null = null;
  private parsedSourcePalette: number[][] = [];

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

  /**
   * Initializes the sprite processing pipeline and generates all
   * palette variants.
   *
   * This method:
   * 1. Parses the source palette for fast RGB lookups
   * 2. Extracts pixel data from the loaded sprite sheet
   * 3. Generates a recolored sprite variant for each defined palette
   *
   * The baseSpritePixels are kept as a reference for the palette
   * swapping, while outputSpriteData provides a clean ImageData
   * template for each variant.
   */
  initializeSprites() {
    if (!this.spriteSheet) {
      browser.showAborted("Unable to use game sprite sheet.");
      throw new Error("Sprite sheet not loaded. Call loadSprites() first.");
    }

    // Pre-parse the source palette hex colors into RGB arrays for
    // fast comparison.
    this.parsePalette();

    // Draw the sprite sheet to a canvas to access raw pixel data.
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

    // Store the original pixel data for palette matching.
    this.baseSpritePixels = baseSpriteData.data;

    // Create a blank ImageData template to copy for each
    // palette variant.
    this.outputSpriteData = baseSpriteContext.createImageData(
      this.baseSpriteCanvas.width,
      this.baseSpriteCanvas.height,
    );

    // Generate a recolored sprite variant for each defined palette.
    Object.entries(palette).forEach(([name, colors]) => {
      if (name !== "source") {
        this.generatePalettedSprite(name, colors);
      }
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

  /**
   * Generates a recolored sprite variant by mapping source palette
   * colors to a target palette. The algorithm is relatively simple.
   *
   * For each pixel in the sprite sheet, find which source palette
   * color it matches. Then replace the pixel color with the
   * corresponding color from the target palette (same index).
   * The alpha channel (transparency) is always preserved.
   *
   * The result is stored as an HTMLImageElement in gameSprites.
   * This is a paletted representation of the spritesheet.
   *
   * @param name - The key to store the palette variant under
   * @param targetPalette - Array of 16 hex color strings
   */
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

    // Create a fresh ImageDat copy to prevent pixel data from
    // being carried over from previous palette iterations.
    const newImageData = new ImageData(
      this.outputSpriteData.data.slice(),
      this.baseSpriteCanvas.width,
      this.baseSpriteCanvas.height,
    );

    // Process each pixel in the sprite sheet.
    // (RGBA = 4 bytes per pixel)
    for (
      let pixel = 0, totalPixels = this.baseSpritePixels.length;
      pixel < totalPixels;
      pixel += 4
    ) {
      // Extract the RGB components of the current pixel from the
      // source sprite.
      const currentRed = this.baseSpritePixels[pixel];
      const currentGreen = this.baseSpritePixels[pixel + 1];
      const currentBlue = this.baseSpritePixels[pixel + 2];

      // Find which of the 16 source palette colors the current
      // pixel mathces.
      for (let color = 0; color < 16; color++) {
        const [sourceRed, sourceGreen, sourceBlue] =
          this.parsedSourcePalette[color];

        // If this pixel matches the source palette color at index
        // 'color' ...
        if (
          currentRed === sourceRed &&
          currentGreen === sourceGreen &&
          currentBlue === sourceBlue
        ) {
          // ... replace it with the target palette color at the
          // same index. Parse the hex color string (RRGGBB format)
          // into RBG bytes.
          const targetColor = targetPalette[color];

          newImageData.data[pixel] = parseInt(targetColor.substring(0, 2), 16);

          newImageData.data[pixel + 1] = parseInt(
            targetColor.substring(2, 4),
            16,
          );

          newImageData.data[pixel + 2] = parseInt(
            targetColor.substring(4, 6),
            16,
          );

          // Preserve the original alpha (transparency) status.
          newImageData.data[pixel + 3] = this.baseSpritePixels[pixel + 3];

          break;
        }
      }
    }

    // Convert the recolored pixel data back into an HTMLImageElement.
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = this.baseSpriteCanvas.width;
    outputCanvas.height = this.baseSpriteCanvas.height;

    const outputContext = graphics.getRenderingContext2D(outputCanvas);
    outputContext.putImageData(newImageData, 0, 0);

    // Store the palette variant as an Image for easy rendering.
    this.gameSprites[name] = new Image();
    this.gameSprites[name].src = outputCanvas.toDataURL("image/png");
  }

  /**
   * Pre-parses source palette hex colors into RBG number arrays.
   *
   * This avoids repeatedly parsing hex strings during pixel-by-pixel
   * palette matching, significantly improving performance.
   */
  private parsePalette() {
    this.parsedSourcePalette = palette.source.map((hexColor) => {
      const red = parseInt(hexColor.substring(0, 2), 16);
      const green = parseInt(hexColor.substring(2, 4), 16);
      const blue = parseInt(hexColor.substring(4, 6), 16);
      return [red, green, blue];
    });
  }
}

export const sprites: Sprites = new Sprites();
