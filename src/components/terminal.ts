import { utils } from "../utils/common";
import { graphics } from "../utils/graphics";
import { roomColors } from "../data/layout";
import { getActualPalette } from "../utils/sprites";
import type { RoomColor } from "../data/layout";

export class Terminal {
  private roomId: number;
  private left: number;
  private bottom: number;
  private gameSprites: HTMLImageElement;
  private paletteName: string;

  // Colored imageData for drawing the furniture.
  private imageData: HTMLImageElement | null = null;

  constructor(
    roomId: number,
    l: number,
    b: number,
    gameSprites: HTMLImageElement,
    paletteName: string,
  ) {
    this.roomId = roomId;
    this.left = l;
    this.bottom = b;
    this.gameSprites = gameSprites;
    this.paletteName = paletteName;
  }

  init() {
    this.generateImage();
  }

  generateImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 22;

    const context = graphics.getRenderingContext2D(canvas);
    context.drawImage(this.gameSprites, 589, 544, 24, 22, 0, 0, 24, 22);

    const baseSpriteData = context.getImageData(0, 0, 24, 22);
    const baseSpritePixels = baseSpriteData.data;
    const newImageData = context.createImageData(24, 22);

    const rcp = getActualPalette(this.paletteName);
    const roomColor = (roomColors as Record<number, RoomColor>)[this.roomId];

    for (let i = 0, n = baseSpritePixels.length; i < n; i += 4) {
      const colorIndex = utils.getColorIndex(
        baseSpritePixels[i],
        baseSpritePixels[i + 1],
        baseSpritePixels[i + 2],
      );

      if (colorIndex === false) {
        // Color not found in palette, copy original pixel
        newImageData.data[i] = baseSpritePixels[i];
        newImageData.data[i + 1] = baseSpritePixels[i + 1];
        newImageData.data[i + 2] = baseSpritePixels[i + 2];
        newImageData.data[i + 3] = baseSpritePixels[i + 3];
        continue;
      }

      let rc;
      if (colorIndex === 14 && roomColor.pg !== undefined) {
        rc = rcp[roomColor.pg];
      } else if (colorIndex === 1 && roomColor.ps !== undefined) {
        rc = rcp[roomColor.ps];
      } else {
        rc = rcp[colorIndex];
      }

      newImageData.data[i] = parseInt(rc[0] + rc[1], 16);
      newImageData.data[i + 1] = parseInt(rc[2] + rc[3], 16);
      newImageData.data[i + 2] = parseInt(rc[4] + rc[5], 16);
      newImageData.data[i + 3] = baseSpritePixels[i + 3];
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 24;
    tmpCanvas.height = 22;

    const tmpContext = graphics.getRenderingContext2D(tmpCanvas);
    tmpContext.putImageData(newImageData, 0, 0);

    this.imageData = new Image();
    this.imageData.src = tmpCanvas.toDataURL("image/png");
  }

  draw() {
    if (!this.imageData) return;

    graphics.drawImage(
      this.imageData,
      0,
      0,
      24,
      22,
      this.left * 8 * 3,
      ((this.bottom + 1) * 8 - 22) * 3,
      24 * 3,
      22 * 3,
    );
  }
}
