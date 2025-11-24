import { browser } from "./browser";

class Graphics {
  private canvas: HTMLCanvasElement | null = null;

  init(canvasId: string) {
    this.canvas = this.getCanvasById(canvasId);
  }

  getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      browser.showError("Canvas has not been initialized.");
      throw new Error("Canvas has not been initialized.");
    }

    return this.canvas;
  }

  private getCanvasById(id: string): HTMLCanvasElement {
    const element = browser.requireElement(id);

    if (!(element instanceof HTMLCanvasElement)) {
      browser.showError(`Unable to initalize ${id} canvas element`);
      throw new Error(`Unable to initalize ${id} canvas element`);
    }

    return element;
  }
}

export const graphics: Graphics = new Graphics();
