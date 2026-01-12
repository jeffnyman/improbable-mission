import { browser } from "./browser";
import { log } from "./logger";
import spriteSheetImg from "/images/sprites.png";

class Sprites {
  loadSprites() {
    const spriteSheet = new Image();

    spriteSheet.onload = () => {
      log("Sprite sheet loaded"); // TEMPORARY
    };

    spriteSheet.onerror = () => {
      browser.showAborted("Unable to load sprite sheet.");
      throw new Error("Unable to load sprite sheet.");
    };

    spriteSheet.src = spriteSheetImg;
  }
}

export const sprites: Sprites = new Sprites();
