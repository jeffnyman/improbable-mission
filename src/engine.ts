import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { log } from "./utils/logger";
import { canvasResizer } from "./ui/canvasResizer";
import { sprites } from "./utils/sprites";

class Engine {
  private animationFrameTime = 0;
  private readonly FRAME_INTERVAL = 30;

  async init() {
    browser.requireElement("app").classList.remove("hidden");

    await sprites.loadSprites();
    graphics.init("game");
    canvasResizer.init();

    this.animate();
  }

  private animationRoutine() {
    log("In animation loop ..."); // TEMPORARY
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
