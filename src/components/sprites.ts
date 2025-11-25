import { browser } from "../utils/browser";

class Sprites {
  private spriteSheet: HTMLImageElement | null = null;

  async loadSprites() {
    return new Promise<void>((resolve, reject) => {
      const spriteSheet = new Image();

      spriteSheet.onload = () => {
        this.spriteSheet = spriteSheet;
        resolve();
      };

      spriteSheet.onerror = () => {
        browser.showError("Unable to load sprite sheet.");
        reject(new Error("Unable to load sprite sheet."));
      };

      spriteSheet.src = `${import.meta.env.BASE_URL}images/sprites.png`;
    });
  }

  getGameSprites() {
    if (!this.spriteSheet) {
      browser.showError("Sprite sheet not loaded.");
      throw new Error("Sprite sheet not loaded.");
    }

    return this.spriteSheet;
  }
}

export const sprites: Sprites = new Sprites();
