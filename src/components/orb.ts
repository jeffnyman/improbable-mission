import { orbEnemies } from "../data/layout";
import { graphics } from "../utils/graphics";
import { getActualPalette } from "../utils/sprites";
import { roomColors } from "../data/layout";
import { utils } from "../utils/common";
import type { OrbEnemyData } from "../utils/types";
import type { RoomColor } from "../data/layout";

export class Orb {
  private roomId: number;
  private x: number;
  private y: number;
  private gameSprites: HTMLImageElement;
  private paletteName: string;

  // Colored imageData for drawing the orb.
  private imageData: HTMLImageElement | null = null;

  constructor(
    roomId: number,
    gameSprites: HTMLImageElement,
    paletteName: string,
  ) {
    this.roomId = roomId;

    // x is the horizontal position (in pixels).
    // y is the vertical position (in pixels).
    this.x = -1;
    this.y = -1;

    this.gameSprites = gameSprites;
    this.paletteName = paletteName;
  }

  init() {
    const orbData = (orbEnemies as Record<number, OrbEnemyData>)[this.roomId];
    this.x = orbData.x;
    this.y = orbData.y;
    this.generateImage();
  }

  generateImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 19;

    const context = graphics.getRenderingContext2D(canvas);
    context.drawImage(this.gameSprites, 0, 581, 24, 19, 0, 0, 24, 19);

    const baseSpriteData = context.getImageData(0, 0, 24, 19);
    const baseSpritePixels = baseSpriteData.data;
    const newImageData = context.createImageData(24, 19);

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

      const rc =
        colorIndex === 1 && roomColor.pb !== undefined
          ? rcp[roomColor.pb]
          : rcp[colorIndex];

      newImageData.data[i] = parseInt(rc[0] + rc[1], 16);
      newImageData.data[i + 1] = parseInt(rc[2] + rc[3], 16);
      newImageData.data[i + 2] = parseInt(rc[4] + rc[5], 16);
      newImageData.data[i + 3] = baseSpritePixels[i + 3];
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 24;
    tmpCanvas.height = 19;

    const tmpContext = graphics.getRenderingContext2D(tmpCanvas);
    tmpContext.putImageData(newImageData, 0, 0);

    this.imageData = new Image();
    this.imageData.src = tmpCanvas.toDataURL("image/png");
  }

  // NOTE: Should this just be draw() to be consistent with
  // others, like furniture and terminal?
  animationRoutine() {
    if (!this.imageData) return;

    graphics.drawImage(
      this.imageData,
      0,
      0,
      24,
      19,
      this.x * 3,
      this.y * 3,
      24 * 3,
      19 * 3,
    );
  }
}
