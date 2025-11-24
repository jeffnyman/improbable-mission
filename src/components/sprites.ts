import { browser } from "../utils/browser";
import { log } from "../utils/logger";

class Sprites {
  async loadSprites() {
    return new Promise<void>((resolve, reject) => {
      const spriteSheet = new Image();

      spriteSheet.onload = () => {
        log(spriteSheet); // TEMPORARY
        resolve();
      };

      spriteSheet.onerror = () => {
        browser.showError("Unable to load sprite sheet.");
        reject(new Error("Unable to load sprite sheet."));
      };

      spriteSheet.src = `${import.meta.env.BASE_URL}images/sprites.png`;
    });
  }
}

export const sprites: Sprites = new Sprites();
