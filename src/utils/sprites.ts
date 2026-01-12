import { browser } from "./browser";
import { log } from "./logger";

class Sprites {
  async loadSprites() {
    return new Promise<void>((resolve, reject) => {
      const spriteSheet = new Image();

      spriteSheet.onload = () => {
        log("Sprite sheet loaded"); // TEMPORARY
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
