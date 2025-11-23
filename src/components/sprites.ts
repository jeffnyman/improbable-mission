import { browser } from "../utils/browser";
import { log } from "../utils/logger";

class Sprites {
  loadSprites() {
    const spriteSheet = new Image();

    spriteSheet.onload = () => {
      log(spriteSheet); // TEMPORARY
    };

    spriteSheet.onerror = () => {
      browser.showError("Unable to load sprite sheet.");
      throw new Error("Unable to load sprite sheet.");
    };

    spriteSheet.src = `${import.meta.env.BASE_URL}images/sprites.png`;
  }
}

export const sprites: Sprites = new Sprites();
