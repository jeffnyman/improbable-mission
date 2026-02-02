import { browser } from "./browser";
import { sprites } from "./sprites";

class Graphics {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private readonly SCALE_FACTOR = 3;

  init(canvasId: string) {
    this.canvas = this.getCanvasById(canvasId);
    this.ctx = this.getRenderingContext2D(this.canvas);
    this.ctx.imageSmoothingEnabled = false;
  }

  draw(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    const spriteSheet = sprites.getSpriteSheet();

    this.ctx.drawImage(
      spriteSheet,
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

  rect(x: number, y: number, w: number, h: number) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

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
