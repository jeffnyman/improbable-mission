import { browser } from "./browser";
import { log } from "./logger";
import spriteSheetImg from "/images/sprites.png";

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

      spriteSheet.src = spriteSheetImg;
    });
  }
}

export const sprites: Sprites = new Sprites();
