import { palette } from "../data/palette";
import { graphics } from "./graphics";
import { utils } from "./common";
import type { PaletteKey, PaletteArray } from "./types";

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
    default:
      return palette.vice;
  }
}

export function replaceColorsInRegions(
  sprites: Record<string, HTMLImageElement>,
  baseSpritePixels: Uint8ClampedArray,
  spriteWidth: number,
  spriteHeight: number,
  regions: { x: number; y: number; w: number; h: number }[],
  colorReplacements: Record<number, number>,
) {
  Object.entries(sprites).forEach(([paletteName, sprite]) => {
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
        const originalColorIndex = utils.getColorIndex(
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
    sprites[paletteName].src = canvas.toDataURL("image/png");
  });
}
