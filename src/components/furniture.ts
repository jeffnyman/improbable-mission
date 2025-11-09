import { utils } from "../utils/common";
import { graphics } from "../utils/graphics";
import { furnitureProperties } from "../data/layout";
import type { FurnitureProperties } from "../utils/types";
import { getActualPalette } from "../utils/sprites";

export class Furniture {
  private roomId: number;
  private kind: string;
  private left: number;
  private bottom: number;
  private gameSprites: HTMLImageElement;
  private paletteName: string;

  // Colored imageData for drawing the furniture.
  private imageData: HTMLImageElement | null = null;

  // The time (measured in pixels) for the item to
  // be searched.
  // @ts-expect-error - Not sure how I will use this yet.
  private searchTime = 0;

  constructor(
    roomId: number,
    kind: string,
    left: number,
    bottom: number,
    gameSprites: HTMLImageElement,
    paletteName: string,
  ) {
    this.roomId = roomId;
    this.kind = kind;
    this.gameSprites = gameSprites;
    this.paletteName = paletteName;

    // Left coordinate can be from 0 to 39.
    this.left = left;

    // Bottom coordinate can be from 0 to 24.
    this.bottom = bottom;
  }

  init() {
    const fp: FurnitureProperties = (
      furnitureProperties as Record<string, FurnitureProperties>
    )[this.kind];
    this.searchTime = fp.s;
    this.generateImage();
  }

  generateImage() {
    const fp: FurnitureProperties = (
      furnitureProperties as Record<string, FurnitureProperties>
    )[this.kind];

    const canvas = document.createElement("canvas");
    canvas.width = fp.w;
    canvas.height = fp.h;

    const context = graphics.getRenderingContext2D(canvas);
    context.drawImage(
      this.gameSprites,
      fp.x,
      fp.y,
      fp.w,
      fp.h,
      0,
      0,
      fp.w,
      fp.h,
    );
    const baseSpriteData = context.getImageData(0, 0, fp.w, fp.h);
    const baseSpritePixels = baseSpriteData.data;
    const newImageData = context.createImageData(fp.w, fp.h);

    const rcp = getActualPalette(this.paletteName);

    for (let i = 0, n = baseSpritePixels.length; i < n; i += 4) {
      const colorIndex = utils.getColorIndex(
        baseSpritePixels[i],
        baseSpritePixels[i + 1],
        baseSpritePixels[i + 2],
      );

      if (colorIndex === false) {
        // Color not found in palette, copy original pixel.
        newImageData.data[i] = baseSpritePixels[i];
        newImageData.data[i + 1] = baseSpritePixels[i + 1];
        newImageData.data[i + 2] = baseSpritePixels[i + 2];
        newImageData.data[i + 3] = baseSpritePixels[i + 3];
        continue;
      }

      const rc =
        fp.r[this.roomId] && colorIndex in fp.r[this.roomId]
          ? rcp[fp.r[this.roomId][colorIndex]]
          : rcp[colorIndex];
      newImageData.data[i] = parseInt(rc[0] + rc[1], 16);
      newImageData.data[i + 1] = parseInt(rc[2] + rc[3], 16);
      newImageData.data[i + 2] = parseInt(rc[4] + rc[5], 16);
      newImageData.data[i + 3] = baseSpritePixels[i + 3];
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = fp.w;
    tmpCanvas.height = fp.h;

    const tmpContext = graphics.getRenderingContext2D(tmpCanvas);
    tmpContext.putImageData(newImageData, 0, 0);

    this.imageData = new Image();
    this.imageData.src = tmpCanvas.toDataURL("image/png");
  }

  draw() {
    if (!this.imageData) return;

    const fp: FurnitureProperties = (
      furnitureProperties as Record<string, FurnitureProperties>
    )[this.kind];

    graphics.drawImage(
      this.imageData,
      0,
      0,
      fp.w,
      fp.h,
      this.left * 8 * 3,
      ((this.bottom + 1) * 8 - fp.h) * 3,
      fp.w * 3,
      fp.h * 3,
    );
  }
}
