import { browser } from "./browser";
import { options } from "./options";
import { sprites } from "./sprites";
import { paletteSelector } from "../ui/paletteSelector";
import type { PaletteArray } from "../types/palette";

class Graphics {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private palette: string | null = null;
  private gameColors: PaletteArray | null = null;
  private readonly SCALE_FACTOR = 3;

  init(canvasId: string) {
    this.canvas = this.getCanvasById(canvasId);
    this.ctx = this.getRenderingContext2D(this.canvas);
    this.ctx.imageSmoothingEnabled = false;
    this.palette = options.getPaletteOption();
    this.gameColors = paletteSelector.getGameColors();
  }

  updatePalette(paletteName: string, colors: PaletteArray) {
    this.palette = paletteName;
    this.gameColors = colors;
  }

  draw(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    if (!this.palette) {
      browser.showAborted("Unable to render based on game palette.");
      throw new Error("Failed to get a valid palette reference.");
    }

    const gameSprites = sprites.getGameSprites();

    this.ctx.drawImage(
      gameSprites[this.palette],
      sx,
      sy,
      sw,
      sh,
      dx * this.SCALE_FACTOR,
      dy * this.SCALE_FACTOR,
      sw * this.SCALE_FACTOR,
      sh * this.SCALE_FACTOR,
    );
  }

  fillStyle(paletteColor: number) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    if (!this.gameColors) return;

    this.ctx.fillStyle = "#" + this.gameColors[paletteColor];
  }

  rect(x: number, y: number, w: number, h: number, paletteColor: number) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    this.fillStyle(paletteColor);

    this.ctx.fillRect(
      x * this.SCALE_FACTOR,
      y * this.SCALE_FACTOR,
      w * this.SCALE_FACTOR,
      h * this.SCALE_FACTOR,
    );
  }

  getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      browser.showAborted("Canvas has not been initialized.");
      throw new Error("Canvas has not been initialized.");
    }

    return this.canvas;
  }

  getRenderingContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    return ctx;
  }

  private getCanvasById(id: string): HTMLCanvasElement {
    const element = browser.requireElement(id);

    if (!(element instanceof HTMLCanvasElement)) {
      browser.showAborted("Unable to find game canvas.");
      throw new Error(`Unable to initialize ${id} canvas element`);
    }

    return element;
  }
}

export const graphics: Graphics = new Graphics();
