/**
 * Utility functions for palette color manipulation.
 *
 * These pure functions handle hex color parsing, palette parsing,
 * and pixel data remapping for sprite palette swapping.
 */

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
