import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { canvasResizer } from "./ui/canvasResizer";
import { fullScreenSelector } from "./ui/fullScreenSelector";
import { paletteSelector } from "./ui/paletteSelector";
import { soundSelector } from "./ui/soundSelector";
import { sprites } from "./utils/sprites";
import { game } from "./game";
import { audio } from "./common/audioManager";

class Engine {
  private animationFrameTime = 0;
  private readonly FRAME_INTERVAL = 30;

  async init() {
    browser.requireElement("app").classList.remove("hidden");

    // Belt and braces: the context is unlocked from the ACCEPT THE
    // MISSION click itself, since the opening crawl runs between that
    // click and this point and would otherwise leave the resume with
    // no gesture behind it.
    audio.unlock();

    await Promise.allSettled([
      audio.loadSounds(),
      sprites.loadSprites(),
      // The C64 font renders the clock and menus on the canvas;
      // canvas fillText won't trigger lazy @font-face loading, so
      // load it explicitly. A failure just falls back to the
      // browser's default font.
      document.fonts.load("24px Sixtyfour"),
    ]);
    sprites.initializeSprites();
    paletteSelector.init();
    soundSelector.init();
    graphics.init("game");
    canvasResizer.init();
    fullScreenSelector.init();

    this.setupDossierItem();
    this.setupOverlay();
    this.setupInputHandling();

    game.init();

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
      if (game.isPaused()) return;
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
      if (game.isPaused()) {
        this.animate();
        return;
      }

      if (actualTime - this.animationFrameTime > this.FRAME_INTERVAL) {
        this.animationFrameTime = actualTime;
        this.animationRoutine();
      }

      this.animate();
    });
  }

  private setupInputHandling() {
    const app = browser.requireElement("app");
    const overlay = browser.requireElement("overlay");

    document.addEventListener("keydown", (evt) => {
      if (app) app.style.cursor = "none";

      if (evt.code === "KeyP" || evt.code === "Pause") {
        game.togglePause();
      }

      if (evt.code === "Escape" && !overlay.classList.contains("hidden")) {
        overlay.click();
      }
    });

    document.addEventListener("mousemove", () => {
      if (app) app.style.cursor = "";
    });
  }

  private setupOverlay() {
    browser.requireElement("overlay").addEventListener("click", () => {
      browser.requireElement("overlay").classList.add("hidden");
      browser.requireElement("dossier").classList.add("hidden");
      game.unpause();
    });
  }

  private setupDossierItem() {
    browser.requireElement("readDossier").addEventListener("click", () => {
      browser.requireElement("overlay").classList.remove("hidden");
      browser.requireElement("dossier").classList.remove("hidden");
      game.pause();
    });
  }
}

export const engine: Engine = new Engine();
