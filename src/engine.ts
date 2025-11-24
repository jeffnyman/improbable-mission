import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { sprites } from "./components/sprites";
import { CanvasResizer } from "./ui/canvasResizer";
import { logOnce } from "./utils/logger";

export class Engine {
  private animationFrameTime = 0;
  private readonly FRAME_INTERVAL = 30;

  async init() {
    await sprites.loadSprites();

    graphics.init("game");

    browser.requireElement("app").classList.remove("hidden");

    new CanvasResizer().init();

    this.animate();
  }

  private animationRoutine() {
    logOnce("In animation loop..."); // REMOVE
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
