import { graphics } from "../utils/graphics";
import { sprites } from "../utils/sprites";
import { options } from "../utils/options";
import { getActualPalette, getColorIndex } from "../utils/paletteUtils";
import { furnitureProperties } from "../data/layout";
import type { FurnitureProperties } from "../types/layout";
import type { FurnitureContentsType } from "../types/furniture";
import type { Puzzle } from "./puzzle";

export class Furniture {
  private roomId: number;
  private kind: string;
  private left: number;
  private bottom: number;
  private spriteSheet = sprites.getSpriteSheet();
  private paletteName = options.getPaletteOption();

  // This indicates what a given furniture item contains, which
  // can be found when searched. The options are nothing, snooze,
  // liftReset, and puzzle.
  private contents: FurnitureContentsType = "nothing";

  // This holds what specific puzzle piece is contained within
  // the furniture item. This is only valid when the contents for
  // the item is "puzzle".
  private puzzle: Puzzle | null = null;

  // Furniture disappears after the agent finishes searching it.
  private visible = true;

  // Remaining search time in pixels (doubles as the progress bar
  // width); initialized from the furniture properties.
  private searchTime = 0;

  // Colored imageData for drawing the furniture.
  private imageData: HTMLImageElement | null = null;

  constructor(roomId: number, kind: string, left: number, bottom: number) {
    this.roomId = roomId;
    this.kind = kind;

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

  getKind() {
    return this.kind;
  }

  getLeft() {
    return this.left;
  }

  getBottom() {
    return this.bottom;
  }

  getPuzzle() {
    return this.puzzle;
  }

  isVisible() {
    return this.visible;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
  }

  getSearchTime() {
    return this.searchTime;
  }

  decrementSearchTime() {
    this.searchTime -= 1;
  }

  getContents() {
    return this.contents;
  }

  setContents(contents: FurnitureContentsType) {
    this.contents = contents;
  }

  setPuzzle(puzzle: Puzzle) {
    this.puzzle = puzzle;
  }

  draw() {
    if (!this.visible) return;
    if (!this.imageData) return;

    const fp: FurnitureProperties = (
      furnitureProperties as Record<string, FurnitureProperties>
    )[this.kind];

    // Convert grid coordinates to pixel coordinates.
    // left is in grid units (0-39), multiply by 8 to get pixels
    // bottom is in grid units (0-24), needs conversion to y from top
    // Screen is 200 pixels tall, bottom row (24) starts at y=192
    const x = this.left * 8;
    const y = this.bottom * 8 + 8 - fp.h;

    graphics.drawImage(
      this.imageData,
      0,
      0,
      fp.w,
      fp.h,
      x * 3,
      y * 3,
      fp.w * 3,
      fp.h * 3,
    );
  }

  private generateImage() {
    const fp: FurnitureProperties = (
      furnitureProperties as Record<string, FurnitureProperties>
    )[this.kind];

    const canvas = document.createElement("canvas");
    canvas.width = fp.w;
    canvas.height = fp.h;

    const context = graphics.getRenderingContext2D(canvas);
    context.drawImage(
      this.spriteSheet,
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
      const colorIndex = getColorIndex(
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
}
