import { graphics } from "./graphics";
import { palette } from "../data/palette";
import { sprites } from "./sprites";
import type { PaletteArray, PaletteKey } from "../types/palette";

/**
 * Utility functions for palette color manipulation.
 *
 * These pure functions handle hex color parsing, palette parsing,
 * and pixel data remapping for sprite palette swapping.
 */

export function getActualPalette(paletteName: string): PaletteArray {
  switch (paletteName) {
    case "ccs64":
      return palette.ccs64;
    case "c64hq":
      return palette.c64hq;
    case "pc64":
      return palette.pc64;
    case "c64s":
      return palette.c64s;
    case "colodore":
      return palette.colodore;
    default:
      return palette.vice;
  }
}

/**
 * Replaces specific color indices within defined regions across
 * all palette variants of the sprite sheet.
 *
 * This function modifies the game sprites in-place by recoloring
 * pixels in specified rectangular regions. For each palette
 * variant, it checks pixels against the original sprite sheet to
 * determine their color index, then applies color replacements
 * only within the target regions.
 *
 * Common use case: Dynamically recoloring elevator sprites to
 * match different elevator shaft colors without regenerating the
 * entire sprite sheet.
 *
 * @param regions - Array of rectangular areas to modify, each defined
 *   by x, y coordinates and width/height in pixels
 * @param colorReplacements - Map of source color indices to target
 *   color indices (e.g., {2: 5, 10: 3} replaces color 2 with 5 and
 *   color 10 with 3)
 *
 * @example
 * // Replace elevator border (color 2) and background (color 10)
 * // in specific sprite regions
 * replaceColorsInRegions(
 *   [{ x: 708, y: 0, w: 64, h: 112 }],
 *   { 2: elevatorColors[3].border, 10: elevatorColors[3].bg }
 * );
 */
export function replaceColorsInRegions(
  regions: { x: number; y: number; w: number; h: number }[],
  colorReplacements: Record<number, number>,
) {
  const gameSprites = sprites.getGameSprites();
  const baseSpritePixels = sprites.getBaseSpritePixels();
  const spriteWidth = sprites.getSpriteWidth();
  const spriteHeight = sprites.getSpriteHeight();

  if (!baseSpritePixels) return;

  Object.entries(gameSprites).forEach(([paletteName, sprite]) => {
    const canvas = document.createElement("canvas");
    canvas.width = spriteWidth;
    canvas.height = spriteHeight;

    const context = graphics.getRenderingContext2D(canvas);
    context.drawImage(sprite, 0, 0);

    const currentImageData = context.getImageData(
      0,
      0,
      spriteWidth,
      spriteHeight,
    );

    const newImageData = context.createImageData(spriteWidth, spriteHeight);

    const pixelData = currentImageData.data;
    const targetPalette = palette[paletteName as PaletteKey];

    for (
      let pixelIndex = 0, totalPixels = pixelData.length;
      pixelIndex < totalPixels;
      pixelIndex += 4
    ) {
      const pixelNumber = Math.floor(pixelIndex / 4);
      const pixelX = pixelNumber % spriteWidth;
      const pixelY = Math.floor(pixelNumber / spriteWidth);
      let pixelWasReplaced = false;

      // Check if pixel is within any target region.
      let isInTargetRegion = false;

      for (const region of regions) {
        if (
          pixelX >= region.x &&
          pixelX < region.x + region.w &&
          pixelY >= region.y &&
          pixelY < region.y + region.h
        ) {
          isInTargetRegion = true;
          break;
        }
      }

      if (isInTargetRegion) {
        // Find the original color index from base sprite.
        const originalColorIndex = getColorIndex(
          baseSpritePixels[pixelIndex],
          baseSpritePixels[pixelIndex + 1],
          baseSpritePixels[pixelIndex + 2],
        );

        if (
          originalColorIndex !== false &&
          originalColorIndex in colorReplacements
        ) {
          const newColorIndex = colorReplacements[originalColorIndex];
          const replacementColor = targetPalette[newColorIndex];

          newImageData.data[pixelIndex] = parseInt(
            replacementColor[0] + replacementColor[1],
            16,
          );

          newImageData.data[pixelIndex + 1] = parseInt(
            replacementColor[2] + replacementColor[3],
            16,
          );

          newImageData.data[pixelIndex + 2] = parseInt(
            replacementColor[4] + replacementColor[5],
            16,
          );

          newImageData.data[pixelIndex + 3] = pixelData[pixelIndex + 3]; // Keep alpha

          pixelWasReplaced = true;
        }
      }

      if (!pixelWasReplaced) {
        // Keep original pixel.
        newImageData.data[pixelIndex] = pixelData[pixelIndex];
        newImageData.data[pixelIndex + 1] = pixelData[pixelIndex + 1];
        newImageData.data[pixelIndex + 2] = pixelData[pixelIndex + 2];
        newImageData.data[pixelIndex + 3] = pixelData[pixelIndex + 3];
      }
    }

    context.putImageData(newImageData, 0, 0);
    gameSprites[paletteName].src = canvas.toDataURL("image/png");
  });
}

/**
 * Finds the index of an RGB color in the game's source palette.
 *
 * Searches the source palette (palette.source) for an exact RGB
 * match. Used primarily for collision detection to identify which
 * palette color a sprite pixel belongs to.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Palette index (0-based), or false if color not found
 *
 * @example
 * // If palette.source[1] is "ff0000" (red)
 * getColorIndex(255, 0, 0) // 1
 * getColorIndex(0, 0, 255) // false (not in palette)
 */
export function getColorIndex(r: number, g: number, b: number): number | false {
  for (let j = 0; j < palette.source.length; j++) {
    const c = palette.source[j];
    const sr = parseInt(c[0] + c[1], 16);
    const sg = parseInt(c[2] + c[3], 16);
    const sb = parseInt(c[4] + c[5], 16);

    if (r === sr && g === sg && b === sb) return j;
  }

  return false;
}

/**
 * Parses a 6-character hex color string (RRGGBB) into an RGB array.
 *
 * @param hexColor - Hex color string; no '#' prefix (e.g., "ff0000")
 * @returns RGB array [red, green, blue] where each value is 0-255
 *
 * @example
 * hexToRgb("ff0000") // [255, 0, 0] - red
 * hexToRgb("00ff00") // [0, 255, 0] - green
 */
export function hexToRgb(hexColor: string): [number, number, number] {
  const red = parseInt(hexColor.substring(0, 2), 16);
  const green = parseInt(hexColor.substring(2, 4), 16);
  const blue = parseInt(hexColor.substring(4, 6), 16);
  return [red, green, blue];
}

/**
 * Parses an array of hex color strings into RGB arrays.
 *
 * @param hexColors - Array of hex color strings
 * @returns Array of RGB arrays
 *
 * @example
 * parsePalette(["000000", "ffffff"]) // [[0,0,0], [255,255,255]]
 */
export function parsePalette(hexColors: string[]): number[][] {
  return hexColors.map(hexToRgb);
}

/**
 * Finds the index of a color in a parsed palette.
 *
 * Uses exact RGB matching to find which palette entry corresponds
 * to a given pixel color.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param parsedPalette - Array of RGB arrays to search
 * @returns Index of matching color, or -1 if not found
 *
 * @example
 * const palette = parsePalette(["000000", "ff0000"]);
 * findPaletteIndex(255, 0, 0, palette) // 1 (red)
 * findPaletteIndex(0, 0, 255, palette) // -1 (not found)
 */
export function findPaletteIndex(
  r: number,
  g: number,
  b: number,
  parsedPalette: number[][],
): number {
  for (let i = 0; i < parsedPalette.length; i++) {
    const [sourceRed, sourceGreen, sourceBlue] = parsedPalette[i];
    if (r === sourceRed && g === sourceGreen && b === sourceBlue) {
      return i;
    }
  }
  return -1;
}

/**
 * Remaps pixel data from source palette to target palette.
 *
 * This is the core algorithm for palette swapping. For each pixel:
 * 1. Find which source palette color it matches
 * 2. Replace with corresponding target palette color (same index)
 * 3. Preserve original alpha (transparency) value
 *
 * Pixels that don't match any source palette color are preserved
 * unchanged.
 *
 * @param sourcePixels - Original pixel data (RGBA; 4 bytes/pixel)
 * @param sourcePalette - Parsed source palette (RGB arrays)
 * @param targetPalette - Target palette (hex color strings)
 * @returns New pixel data with remapped colors
 *
 * @example
 * const sourcePixels = new Uint8ClampedArray([0, 0, 0, 255]); // black
 * const sourcePalette = parsePalette(["000000", "ffffff"]);
 * const targetPalette = ["ff0000", "00ff00"]; // red, green
 * remapPixelData(sourcePixels, sourcePalette, targetPalette)
 * // Returns [255, 0, 0, 255] - black became red
 */
export function remapPixelData(
  sourcePixels: Uint8ClampedArray,
  sourcePalette: number[][],
  targetPalette: string[],
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(sourcePixels.length);

  // Process each pixel (RGBA = 4 bytes per pixel)
  for (let pixel = 0; pixel < sourcePixels.length; pixel += 4) {
    const r = sourcePixels[pixel];
    const g = sourcePixels[pixel + 1];
    const b = sourcePixels[pixel + 2];
    const a = sourcePixels[pixel + 3];

    // Find which source palette color this pixel matches
    const paletteIndex = findPaletteIndex(r, g, b, sourcePalette);

    if (paletteIndex !== -1) {
      // Replace with target palette color at same index
      const targetColor = targetPalette[paletteIndex];
      output[pixel] = parseInt(targetColor.substring(0, 2), 16);
      output[pixel + 1] = parseInt(targetColor.substring(2, 4), 16);
      output[pixel + 2] = parseInt(targetColor.substring(4, 6), 16);
      // Preserve alpha from source
      output[pixel + 3] = a;
    }
    // If no match found, leave pixel as transparent (0,0,0,0), the
    // default. This means unmatched pixels are not written.
  }

  return output;
}
