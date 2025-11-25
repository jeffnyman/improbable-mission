import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { sprites } from "./components/sprites";
import { CanvasResizer } from "./ui/canvasResizer";
import { Game } from "./game";

export class Engine {
  private game: Game = new Game();
  private animationFrameTime = 0;
  private readonly FRAME_INTERVAL = 30;

  async init() {
    await sprites.loadSprites();
    sprites.initializeSprites();

    graphics.init("game", "vice");

    browser.requireElement("app").classList.remove("hidden");

    new CanvasResizer().init();

    this.animate();
  }

  private animationRoutine() {
    this.game.updateAnimation();
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
