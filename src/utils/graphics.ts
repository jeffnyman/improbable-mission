import { browser } from "./browser";
import { sprites } from "../components/sprites";

class Graphics {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  init(canvasId: string) {
    this.canvas = this.getCanvasById(canvasId);
    this.ctx = this.getRenderingContext2D(this.canvas);
    this.ctx.imageSmoothingEnabled = false;
  }

  getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      browser.showError("Canvas has not been initialized.");
      throw new Error("Canvas has not been initialized.");
    }

    return this.canvas;
  }

  rect(x: number, y: number, w: number, h: number) {
    if (!this.ctx) {
      browser.showError("Graphics not initialized.");
      throw new Error("Graphics not initialized.");
    }

    this.ctx.fillRect(x * 3, y * 3, w * 3, h * 3);
  }

  draw(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number) {
    if (!this.ctx) {
      browser.showError("Graphics not initialized.");
      throw new Error("Graphics not initialized.");
    }

    const sprite = sprites.getGameSprites();

    this.ctx.drawImage(sprite, sx, sy, sw, sh, dx * 3, dy * 3, sw * 3, sh * 3);
  }

  private getCanvasById(id: string): HTMLCanvasElement {
    const element = browser.requireElement(id);

    if (!(element instanceof HTMLCanvasElement)) {
      browser.showError(`Unable to initalize ${id} canvas element`);
      throw new Error(`Unable to initalize ${id} canvas element`);
    }

    return element;
  }

  private getRenderingContext2D(
    canvas: HTMLCanvasElement,
  ): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      browser.showError("Failed to get 2D rendering context.");
      throw new Error("Failed to get 2D rendering context.");
    }

    return ctx;
  }
}

export const graphics: Graphics = new Graphics();
