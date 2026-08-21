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

  hasSpriteSheet(): boolean {
    return this.spriteSheet !== null;
  }

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

  getBaseSpritePixels() {
    return this.baseSpritePixels;
  }

  getSpriteWidth(): number {
    return this.baseSpriteCanvas?.width ?? 0;
  }

  getSpriteHeight(): number {
    return this.baseSpriteCanvas?.height ?? 0;
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

  /**
   * Detects collision between two axis-aligned bounding boxes (AABB).
   *
   * Uses the separation axis theorem: two rectangles collide if and
   * only if they overlap on both the X and Y axes. The method checks
   * for separation (non-overlap) on each axis and returns false if
   * any separation is found.
   *
   * @param x1 - Left edge of first rectangle
   * @param y1 - Top edge of first rectangle
   * @param w1 - Width of first rectangle
   * @param h1 - Height of first rectangle
   * @param x2 - Left edge of second rectangle
   * @param y2 - Top edge of second rectangle
   * @param w2 - Width of second rectangle
   * @param h2 - Height of second rectangle
   * @returns true if rectangles overlap, false if separated
   *
   * @example
   * // Check if agent collides with platform
   * const collision = sprites.collisionDetect(
   *   agentX, agentY, 32, 40,      // Agent bounds
   *   platformX, platformY, 64, 8   // Platform bounds
   * );
   */
  collisionDetect(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number,
  ) {
    // Calculate the bounds of each rectangle
    const minX1 = x1;
    const maxX1 = x1 + w1;
    const minX2 = x2;
    const maxX2 = x2 + w2;

    const minY1 = y1;
    const maxY1 = y1 + h1;
    const minY2 = y2;
    const maxY2 = y2 + h2;

    // Check for separation on X axis: if rect1 is entirely left or
    // right of rect2, they cannot be colliding
    if (maxX1 < minX2) return false; // rect1 is left of rect2
    if (minX1 > maxX2) return false; // rect1 is right of rect2

    // Check for separation on Y axis: if rect1 is entirely above or
    // below rect2, they cannot be colliding
    if (maxY1 < minY2) return false; // rect1 is above rect2
    if (minY1 > maxY2) return false; // rect1 is below rect2

    // No separation found on either axis, so rectangles must overlap
    return true;
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
