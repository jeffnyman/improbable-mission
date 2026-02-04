import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { canvasResizer } from "./ui/canvasResizer";
import { paletteSelector } from "./ui/paletteSelector";
import { sprites } from "./utils/sprites";
import { game } from "./game";
import { audio } from "./common/audioManager";

class Engine {
  private animationFrameTime = 0;
  private readonly FRAME_INTERVAL = 30;

  async init() {
    browser.requireElement("app").classList.remove("hidden");

    await Promise.allSettled([audio.loadSounds(), sprites.loadSprites()]);
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

  /**
   * Starts the scan loop for game logic updates.
   *
   * Uses setInterval with a fixed 27ms interval (~37 FPS) to update
   * game state, physics, and input handling. This runs independently
   * from rendering to ensure consistent game logic timing.
   */
  private scan() {
    setInterval(() => {
      this.scanRoutine();
    }, 27);
  }

  private animationRoutine() {
    game.updateAnimation();
  }

  /**
   * Starts the animation loop for rendering.
   *
   * Uses requestAnimationFrame with throttling (FRAME_INTERVAL = 30ms)
   * to render graphics at ~33 FPS. Separated from game logic (scan loop)
   * to allow rendering to adapt to browser performance while maintaining
   * consistent game simulation speed.
   */
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
