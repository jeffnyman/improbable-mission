import { rnd } from "../utils/common";
import { graphics } from "../utils/graphics";
import { sprites } from "../utils/sprites";
import { options } from "../utils/options";
import { palette } from "../data/palette";
import { getActualPalette } from "../utils/paletteUtils";

/**
 * One of the 36 punch-card puzzle pieces, ported from the
 * original puzzles.js. Pieces come in 9 sets of 4; a set is
 * solved by stacking all four pieces in the same color and the
 * correct orientation on the pocket computer's desktop.
 */
export class Puzzle {
  // The puzzle id (0-35).
  private num: number;

  // The puzzle set (0-8) and position within the set (0-3).
  private set: number;
  private numOfSet: number;

  // Piece color: 5=green, 7=yellow, 3=cyan.
  private color = 5;

  // Orientation flips.
  private flipV = false;
  private flipH = false;

  // Set after the phone's orientation-correction service ran on
  // this piece; shown as a marker in the memory list.
  private correctOrientation = false;

  // Rotated, colored image for drawing.
  private imageData: HTMLImageElement | null = null;

  // Sprite sheet coordinates for this piece.
  private graphics: { x: number; y: number };

  // Pieces merged onto this one on the desktop.
  private overlapPuzzles: Puzzle[] = [];

  constructor(num: number) {
    this.num = num;
    this.set = Math.floor(num / 4);
    this.numOfSet = num % 4;
    this.graphics = { x: 449 + this.numOfSet * 50, y: 1 + this.set * 25 };
  }

  getNum() {
    return this.num;
  }

  getSet() {
    return this.set;
  }

  getColor() {
    return this.color;
  }

  setColor(color: number) {
    this.color = color;
  }

  getFlipV() {
    return this.flipV;
  }

  setFlipV(flip: boolean) {
    this.flipV = flip;
  }

  getFlipH() {
    return this.flipH;
  }

  setFlipH(flip: boolean) {
    this.flipH = flip;
  }

  hasCorrectOrientation() {
    return this.correctOrientation;
  }

  getOverlapPuzzles() {
    return this.overlapPuzzles;
  }

  setRandomProperties(color?: number) {
    if (!color) {
      this.color = [5, 7, 3][rnd(3) - 1];
    } else {
      this.color = color;
    }

    this.flipV = rnd(2) === 1;
    this.flipH = rnd(2) === 1;
    this.generateImage();
  }

  clone(): Puzzle {
    const clone = new Puzzle(this.num);
    clone.color = this.color;
    clone.flipV = this.flipV;
    clone.flipH = this.flipH;

    clone.generateImage();

    for (let i = 0; i < this.overlapPuzzles.length; i++) {
      clone.overlapPuzzles[i] = this.overlapPuzzles[i].clone();
    }

    return clone;
  }

  generateImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 21;
    const context = graphics.getRenderingContext2D(canvas);

    if (this.flipH) {
      context.translate(48, 0);
      context.scale(-1, 1);
    }

    if (this.flipV) {
      context.translate(0, 21);
      context.scale(1, -1);
    }

    context.drawImage(
      sprites.getSpriteSheet(),
      this.graphics.x,
      this.graphics.y,
      48,
      21,
      0,
      0,
      48,
      21,
    );

    const baseSpriteData = context.getImageData(0, 0, 48, 21);
    const baseSpritePixels = baseSpriteData.data;
    const newImageData = context.createImageData(48, 21);

    const color = getActualPalette(options.getPaletteOption())[this.color];
    const colorBlack = palette.source[0];

    for (let i = 0, n = baseSpritePixels.length; i < n; i += 4) {
      const c = baseSpritePixels[i];

      if (c === 0) {
        newImageData.data[i] = parseInt(color[0] + color[1], 16);
        newImageData.data[i + 1] = parseInt(color[2] + color[3], 16);
        newImageData.data[i + 2] = parseInt(color[4] + color[5], 16);
        newImageData.data[i + 3] = baseSpritePixels[i + 3];
      } else {
        newImageData.data[i] = parseInt(colorBlack[0] + colorBlack[1], 16);
        newImageData.data[i + 1] = parseInt(colorBlack[2] + colorBlack[3], 16);
        newImageData.data[i + 2] = parseInt(colorBlack[4] + colorBlack[5], 16);
        newImageData.data[i + 3] = baseSpritePixels[i + 3];
      }
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 48;
    tmpCanvas.height = 21;
    const tmpContext = graphics.getRenderingContext2D(tmpCanvas);
    tmpContext.putImageData(newImageData, 0, 0);

    this.imageData = new Image();
    this.imageData.src = tmpCanvas.toDataURL("image/png");
  }

  draw(x: number, y: number) {
    if (!this.imageData) return;

    graphics.drawImage(this.imageData, 0, 0, 48, 21, x * 3, y * 3, 48 * 3, 21 * 3);

    for (const overlap of this.overlapPuzzles) {
      if (overlap.imageData) {
        graphics.drawImage(
          overlap.imageData,
          0,
          0,
          48,
          21,
          x * 3,
          y * 3,
          48 * 3,
          21 * 3,
        );
      }
    }
  }

  /**
   * The phone's orientation-correction service: un-flips the
   * piece and marks it corrected.
   */
  fixOrientation() {
    this.flipV = false;
    this.flipH = false;
    this.correctOrientation = true;
    this.generateImage();
  }

  /**
   * Attempts to merge another piece onto this one. The stacked
   * images must share exactly 172 opaque pixels — the piece
   * frame — meaning their interiors don't collide. On success,
   * beforeMerge runs (the pocket computer snapshots this piece
   * for undo) before the merge mutates it.
   */
  overlap(puzzle: Puzzle, beforeMerge: () => void): boolean {
    // The cumulated "original" puzzle.
    const origCanvas = document.createElement("canvas");
    origCanvas.width = 48;
    origCanvas.height = 21;
    const origContext = graphics.getRenderingContext2D(origCanvas);
    if (this.imageData) origContext.drawImage(this.imageData, 0, 0);

    for (const overlapPiece of this.overlapPuzzles) {
      if (overlapPiece.imageData) {
        origContext.drawImage(overlapPiece.imageData, 0, 0);
      }
    }

    const origPixels = origContext.getImageData(0, 0, 48, 21).data;

    // The overlapped puzzle.
    const newCanvas = document.createElement("canvas");
    newCanvas.width = 48;
    newCanvas.height = 21;
    const newContext = graphics.getRenderingContext2D(newCanvas);
    if (puzzle.imageData) newContext.drawImage(puzzle.imageData, 0, 0);

    for (const overlapPiece of puzzle.overlapPuzzles) {
      if (overlapPiece.imageData) {
        newContext.drawImage(overlapPiece.imageData, 0, 0);
      }
    }

    const newPixels = newContext.getImageData(0, 0, 48, 21).data;

    // Compare: count pixels opaque in both images.
    let fadeCount = 0;
    for (let i = 0, n = origPixels.length; i < n; i += 4) {
      if (origPixels[i + 3] === 255 && newPixels[i + 3] === 255) fadeCount++;
    }

    if (fadeCount === 172) {
      beforeMerge();

      this.overlapPuzzles.push(puzzle.clone());
      for (const overlapPiece of puzzle.overlapPuzzles) {
        this.overlapPuzzles.push(overlapPiece.clone());
      }

      return true;
    }

    return false;
  }

  isSolved(): boolean {
    if (this.flipV || this.flipH) return false;
    if (this.overlapPuzzles.length !== 3) return false;

    return true;
  }
}
