import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { options } from "./utils/options";
import { audio } from "./components/audio";
import { sprites } from "./components/sprites";
import { CanvasResizer } from "./ui/canvasResizer";
import { PaletteSelector } from "./ui/paletteSelector";
import { SoundSelector } from "./ui/soundSelector";
import { FullScreenSelector } from "./ui/fullScreenSelector";
import { Game } from "./game";
import { palette } from "./data/palette";

export class Engine {
  private game: Game = new Game();
  private paletteSelector: PaletteSelector = new PaletteSelector();
  private soundSelector: SoundSelector = new SoundSelector();
  private animationFrameTime = 0;
  private readonly FRAME_INTERVAL = 30;

  async init() {
    await audio.loadSounds();
    await sprites.loadSprites();
    sprites.initializeSprites();

    graphics.init(
      "game",
      () => this.currentGameColors(),
      () => options.getPaletteOption(),
    );

    browser.requireElement("app").classList.remove("hidden");

    new CanvasResizer().init();
    new FullScreenSelector().init();
    this.paletteSelector.init();
    this.soundSelector.init();
    this.setupInputHandling();

    this.animate();
    this.scan();
  }

  private currentGameColors(): string[] {
    return this.paletteSelector.getGameColors() || palette.vice;
  }

  private scanRoutine() {
    this.game.updateScan();
  }

  private scan() {
    setInterval(() => {
      if (this.game.isPaused()) return;
      this.scanRoutine();
    }, 27);
  }

  private animationRoutine() {
    this.game.updateAnimation();
  }

  private animate() {
    requestAnimationFrame((actualTime) => {
      if (actualTime - this.animationFrameTime > this.FRAME_INTERVAL) {
        if (this.game.isPaused()) {
          this.animate();
          return;
        }

        this.animationFrameTime = actualTime;
        this.animationRoutine();
      }

      this.animate();
    });
  }

  private setupInputHandling() {
    const app = browser.requireElement("app");

    document.addEventListener("keydown", (evt) => {
      if (app) app.style.cursor = "none";

      if (evt.code === "KeyP" || evt.code === "Pause") {
        this.game.togglePause();
      }
    });

    document.addEventListener("mousemove", () => {
      if (app) app.style.cursor = "";
    });
  }
}
