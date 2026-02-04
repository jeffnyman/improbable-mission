import { describe, test, expect } from "vitest";
import {
  hexToRgb,
  parsePalette,
  findPaletteIndex,
  remapPixelData,
} from "../src/utils/paletteUtils";

/**
 * Test suite for palette manipulation utilities.
 *
 * These tests validate the core algorithmic logic used for sprite
 * palette swapping in the game.
 */
describe("paletteUtils", () => {
  describe("hexToRgb", () => {
    test("parses pure black", () => {
      expect(hexToRgb("000000")).toEqual([0, 0, 0]);
    });

    test("parses pure white", () => {
      expect(hexToRgb("ffffff")).toEqual([255, 255, 255]);
    });

    test("parses pure red", () => {
      expect(hexToRgb("ff0000")).toEqual([255, 0, 0]);
    });

    test("parses pure green", () => {
      expect(hexToRgb("00ff00")).toEqual([0, 255, 0]);
    });

    test("parses pure blue", () => {
      expect(hexToRgb("0000ff")).toEqual([0, 0, 255]);
    });

    test("parses C64 colors correctly", () => {
      expect(hexToRgb("aa0000")).toEqual([170, 0, 0]); // Red
      expect(hexToRgb("00aaaa")).toEqual([0, 170, 170]); // Cyan
      expect(hexToRgb("aa00aa")).toEqual([170, 0, 170]); // Purple
      expect(hexToRgb("00aa00")).toEqual([0, 170, 0]); // Green
      expect(hexToRgb("0000aa")).toEqual([0, 0, 170]); // Blue
      expect(hexToRgb("dddd00")).toEqual([221, 221, 0]); // Yellow
    });

    test("handles lowercase hex strings", () => {
      expect(hexToRgb("aabbcc")).toEqual([170, 187, 204]);
    });

    test("handles mixed case hex strings", () => {
      expect(hexToRgb("AaBbCc")).toEqual([170, 187, 204]);
    });

    test("parses mid-range gray values", () => {
      expect(hexToRgb("444444")).toEqual([68, 68, 68]);
      expect(hexToRgb("666666")).toEqual([102, 102, 102]);
      expect(hexToRgb("dddddd")).toEqual([221, 221, 221]);
    });
  });

  describe("parsePalette", () => {
    test("parses a simple 2-color palette", () => {
      const result = parsePalette(["000000", "ffffff"]);
      expect(result).toEqual([
        [0, 0, 0],
        [255, 255, 255],
      ]);
    });

    test("parses the standard C64 source palette (16 colors)", () => {
      const sourcePalette = [
        "000000",
        "ffffff",
        "aa0000",
        "00aaaa",
        "aa00aa",
        "00aa00",
        "0000aa",
        "dddd00",
        "ddaa00",
        "aa6600",
        "ddaaaa",
        "444444",
        "666666",
        "aaddaa",
        "aaaadd",
        "dddddd",
      ];

      const result = parsePalette(sourcePalette);

      expect(result).toHaveLength(16);
      expect(result[0]).toEqual([0, 0, 0]); // Black
      expect(result[1]).toEqual([255, 255, 255]); // White
      expect(result[2]).toEqual([170, 0, 0]); // Red
      expect(result[15]).toEqual([221, 221, 221]); // Light gray
    });

    test("handles empty palette", () => {
      expect(parsePalette([])).toEqual([]);
    });

    test("handles single color palette", () => {
      expect(parsePalette(["ff00ff"])).toEqual([[255, 0, 255]]);
    });
  });

  describe("findPaletteIndex", () => {
    const testPalette = parsePalette([
      "000000", // 0: Black
      "ffffff", // 1: White
      "ff0000", // 2: Red
      "00ff00", // 3: Green
      "0000ff", // 4: Blue
    ]);

    test("finds black at index 0", () => {
      expect(findPaletteIndex(0, 0, 0, testPalette)).toBe(0);
    });

    test("finds white at index 1", () => {
      expect(findPaletteIndex(255, 255, 255, testPalette)).toBe(1);
    });

    test("finds red at index 2", () => {
      expect(findPaletteIndex(255, 0, 0, testPalette)).toBe(2);
    });

    test("finds green at index 3", () => {
      expect(findPaletteIndex(0, 255, 0, testPalette)).toBe(3);
    });

    test("finds blue at index 4", () => {
      expect(findPaletteIndex(0, 0, 255, testPalette)).toBe(4);
    });

    test("returns -1 for color not in palette", () => {
      expect(findPaletteIndex(123, 45, 67, testPalette)).toBe(-1);
    });

    test("returns -1 for near-miss colors", () => {
      // Almost white, but not quite
      expect(findPaletteIndex(254, 255, 255, testPalette)).toBe(-1);
      expect(findPaletteIndex(255, 254, 255, testPalette)).toBe(-1);
    });

    test("returns first match if duplicate colors exist", () => {
      const duplicatePalette = parsePalette(["ff0000", "ff0000", "0000ff"]);
      expect(findPaletteIndex(255, 0, 0, duplicatePalette)).toBe(0);
    });
  });

  describe("remapPixelData", () => {
    test("remaps a single pixel from black to red", () => {
      const sourcePalette = parsePalette(["000000", "ffffff"]);
      const targetPalette = ["ff0000", "00ff00"]; // Red, Green

      // Single black pixel with full opacity
      const sourcePixels = new Uint8ClampedArray([0, 0, 0, 255]);
      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      // Should become red
      expect(result).toEqual(new Uint8ClampedArray([255, 0, 0, 255]));
    });

    test("remaps a single white pixel to green", () => {
      const sourcePalette = parsePalette(["000000", "ffffff"]);
      const targetPalette = ["ff0000", "00ff00"]; // Red, Green

      // Single white pixel with full opacity
      const sourcePixels = new Uint8ClampedArray([255, 255, 255, 255]);
      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      // Should become green
      expect(result).toEqual(new Uint8ClampedArray([0, 255, 0, 255]));
    });

    test("preserves alpha channel for transparent pixels", () => {
      const sourcePalette = parsePalette(["000000"]);
      const targetPalette = ["ff0000"];

      // Black pixel with 50% transparency
      const sourcePixels = new Uint8ClampedArray([0, 0, 0, 128]);
      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      // Should become red but keep alpha at 128
      expect(result).toEqual(new Uint8ClampedArray([255, 0, 0, 128]));
    });

    test("preserves alpha channel at 0 (fully transparent)", () => {
      const sourcePalette = parsePalette(["000000"]);
      const targetPalette = ["ff0000"];

      const sourcePixels = new Uint8ClampedArray([0, 0, 0, 0]);
      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      expect(result).toEqual(new Uint8ClampedArray([255, 0, 0, 0]));
    });

    test("handles multiple pixels in sequence", () => {
      const sourcePalette = parsePalette(["000000", "ffffff"]);
      const targetPalette = ["ff0000", "00ff00"];

      // Black, White, Black, White
      const sourcePixels = new Uint8ClampedArray([
        0,
        0,
        0,
        255, // Black
        255,
        255,
        255,
        255, // White
        0,
        0,
        0,
        255, // Black
        255,
        255,
        255,
        255, // White
      ]);

      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      // Should become Red, Green, Red, Green
      expect(result).toEqual(
        new Uint8ClampedArray([
          255,
          0,
          0,
          255, // Red
          0,
          255,
          0,
          255, // Green
          255,
          0,
          0,
          255, // Red
          0,
          255,
          0,
          255, // Green
        ]),
      );
    });

    test("makes colors not in source palette transparent", () => {
      const sourcePalette = parsePalette(["000000", "ffffff"]);
      const targetPalette = ["ff0000", "00ff00"];

      // Gray pixel not in palette
      const sourcePixels = new Uint8ClampedArray([128, 128, 128, 255]);
      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      // Should become transparent (not in palette)
      expect(result).toEqual(new Uint8ClampedArray([0, 0, 0, 0]));
    });

    test("handles a realistic C64 palette swap scenario", () => {
      // Source: C64 black and red
      const sourcePalette = parsePalette(["000000", "aa0000"]);
      // Target: Vice palette equivalents
      const targetPalette = ["000000", "68372b"];

      // Pattern: Black, Red, Black, Red
      const sourcePixels = new Uint8ClampedArray([
        0,
        0,
        0,
        255, // Black
        170,
        0,
        0,
        255, // C64 Red
        0,
        0,
        0,
        255, // Black
        170,
        0,
        0,
        255, // C64 Red
      ]);

      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      // Check that C64 red (170,0,0) became Vice red (104,55,43)
      expect(result[4]).toBe(104); // R
      expect(result[5]).toBe(55); // G
      expect(result[6]).toBe(43); // B
      expect(result[7]).toBe(255); // Alpha preserved

      // Check that black stayed black
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
    });

    test("handles all 16 C64 palette colors", () => {
      const sourcePalette = parsePalette([
        "000000",
        "ffffff",
        "aa0000",
        "00aaaa",
        "aa00aa",
        "00aa00",
        "0000aa",
        "dddd00",
        "ddaa00",
        "aa6600",
        "ddaaaa",
        "444444",
        "666666",
        "aaddaa",
        "aaaadd",
        "dddddd",
      ]);

      // Simple target: invert each color's index for testing
      const targetPalette = [
        "ff0000",
        "00ff00",
        "0000ff",
        "ffff00",
        "ff00ff",
        "00ffff",
        "880000",
        "008800",
        "000088",
        "888800",
        "880088",
        "008888",
        "444444",
        "888888",
        "cccccc",
        "ffffff",
      ];

      // Create pixel data with one pixel for each palette color
      const sourcePixels = new Uint8ClampedArray(16 * 4);
      sourcePalette.forEach(([r, g, b], i) => {
        sourcePixels[i * 4] = r;
        sourcePixels[i * 4 + 1] = g;
        sourcePixels[i * 4 + 2] = b;
        sourcePixels[i * 4 + 3] = 255;
      });

      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      // Verify each pixel was remapped to its target color
      targetPalette.forEach((hexColor, i) => {
        const [expectedR, expectedG, expectedB] = hexToRgb(hexColor);
        expect(result[i * 4]).toBe(expectedR);
        expect(result[i * 4 + 1]).toBe(expectedG);
        expect(result[i * 4 + 2]).toBe(expectedB);
        expect(result[i * 4 + 3]).toBe(255); // Alpha preserved
      });
    });

    test("handles empty pixel data", () => {
      const sourcePalette = parsePalette(["000000"]);
      const targetPalette = ["ff0000"];
      const sourcePixels = new Uint8ClampedArray([]);

      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      expect(result).toEqual(new Uint8ClampedArray([]));
    });

    test("handles varying alpha values correctly", () => {
      const sourcePalette = parsePalette(["000000"]);
      const targetPalette = ["ffffff"];

      const sourcePixels = new Uint8ClampedArray([
        0,
        0,
        0,
        0, // Fully transparent
        0,
        0,
        0,
        64, // 25%
        0,
        0,
        0,
        128, // 50%
        0,
        0,
        0,
        192, // 75%
        0,
        0,
        0,
        255, // Fully opaque
      ]);

      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);

      // All should be white, but with original alpha
      expect(result[0]).toBe(255);
      expect(result[3]).toBe(0);
      expect(result[7]).toBe(64);
      expect(result[11]).toBe(128);
      expect(result[15]).toBe(192);
      expect(result[19]).toBe(255);
    });
  });

  describe("Performance", () => {
    test("handles large pixel arrays efficiently", () => {
      const sourcePalette = parsePalette(["000000", "ffffff"]);
      const targetPalette = ["ff0000", "00ff00"];

      // Simulate a 100x100 image (10,000 pixels)
      const pixelCount = 100 * 100;
      const sourcePixels = new Uint8ClampedArray(pixelCount * 4);

      // Fill with alternating black and white
      for (let i = 0; i < pixelCount; i++) {
        const isBlack = i % 2 === 0;
        sourcePixels[i * 4] = isBlack ? 0 : 255;
        sourcePixels[i * 4 + 1] = isBlack ? 0 : 255;
        sourcePixels[i * 4 + 2] = isBlack ? 0 : 255;
        sourcePixels[i * 4 + 3] = 255;
      }

      const start = performance.now();
      const result = remapPixelData(sourcePixels, sourcePalette, targetPalette);
      const duration = performance.now() - start;

      expect(result).toHaveLength(pixelCount * 4);
      expect(duration).toBeLessThan(100); // Should complete in < 100ms

      // Verify first few pixels are correct
      expect(result[0]).toBe(255); // First pixel: black → red
      expect(result[4]).toBe(0); // Second pixel: white → green
      expect(result[5]).toBe(255);
    });
  });
});
