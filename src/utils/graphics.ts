import { browser } from "./browser";

class Graphics {
  init(canvasId: string) {
    this.getCanvasById(canvasId);
  }

  private getCanvasById(id: string): HTMLCanvasElement {
    const element = browser.requireElement(id);

    if (!(element instanceof HTMLCanvasElement)) {
      browser.showAborted("Unable to find game canvas");
      throw new Error(`Unable to initialize ${id} canvas element`);
    }

    return element;
  }
}

export const graphics: Graphics = new Graphics();
