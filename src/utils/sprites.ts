import { browser } from "./browser";
import { graphics } from "./graphics";
import { palette } from "../data/palette";
import { parsePalette, remapPixelData } from "./paletteUtils";

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
    this.parsedSourcePalette = parsePalette(palette.source);

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
   * colors to a target palette.
   *
   * Uses the paletteUtils module to perform the actual color
   * remapping, then converts the result to an HTMLImageElement
   * for rendering.
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

    // Use the palette utility to remap the pixel data
    const remappedPixels = remapPixelData(
      this.baseSpritePixels,
      this.parsedSourcePalette,
      targetPalette,
    );

    // Create a fresh ImageData and copy the remapped pixels into it.
    const newImageData = new ImageData(
      this.baseSpriteCanvas.width,
      this.baseSpriteCanvas.height,
    );

    newImageData.data.set(remappedPixels);

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
}

export const sprites: Sprites = new Sprites();
