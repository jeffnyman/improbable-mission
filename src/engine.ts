import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { canvasResizer } from "./ui/canvasResizer";
import { paletteSelector } from "./ui/paletteSelector";
import { sprites } from "./utils/sprites";
import { game } from "./game";

class Engine {
  private animationFrameTime = 0;
  private readonly FRAME_INTERVAL = 30;

  async init() {
    browser.requireElement("app").classList.remove("hidden");

    await sprites.loadSprites();
    sprites.initializeSprites();
    paletteSelector.init();
    graphics.init("game");
    canvasResizer.init();

    this.animate();
    this.scan();
  }

  private scanRoutine() {
    game.updateScan();
  }

  private scan() {
    setInterval(() => {
      this.scanRoutine();
    }, 27);
  }

  private animationRoutine() {
    game.updateAnimation();
  }

  private animate() {
    requestAnimationFrame((actualTime) => {
      if (actualTime - this.animationFrameTime > this.FRAME_INTERVAL) {
        this.animationFrameTime = actualTime;
        this.animationRoutine();
      }

      this.animate();
    });
  }
}

export const engine: Engine = new Engine();
