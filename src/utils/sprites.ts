import { browser } from "./browser";

class Sprites {
  private spriteSheet: HTMLImageElement | null = null;

  getSpriteSheet(): HTMLImageElement {
    if (!this.spriteSheet) {
      browser.showAborted("Unable to use game sprite sheet.");
      throw new Error("Sprite sheet not loaded. Call loadSprites() first.");
    }

    return this.spriteSheet;
  }

  async loadSprites() {
    return new Promise<void>((resolve, reject) => {
      const spriteSheet = new Image();

      spriteSheet.onload = () => {
        this.spriteSheet = spriteSheet;
        resolve();
      };

      spriteSheet.onerror = () => {
        browser.showAborted("Unable to load sprite sheet.");
        reject(new Error("Unable to load sprite sheet."));
      };

      spriteSheet.src = `${import.meta.env.BASE_URL}images/sprites.png`;
    });
  }
}

export const sprites: Sprites = new Sprites();
