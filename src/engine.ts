import { browser } from "./utils/browser";
import { graphics } from "./utils/graphics";
import { options } from "./utils/options";
import { sprites } from "./components/sprites";
import { CanvasResizer } from "./ui/canvasResizer";
import { PaletteSelector } from "./ui/paletteSelector";
import { Game } from "./game";
import { palette } from "./data/palette";

export class Engine {
  private game: Game = new Game();
  private paletteSelector: PaletteSelector = new PaletteSelector();
  private animationFrameTime = 0;
  private readonly FRAME_INTERVAL = 30;

  async init() {
    await sprites.loadSprites();
    sprites.initializeSprites();

    graphics.init(
      "game",
      () => this.currentGameColors(),
      () => options.getPaletteOption(),
    );

    browser.requireElement("app").classList.remove("hidden");

    new CanvasResizer().init();
    this.paletteSelector.init();
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
      this.scanRoutine();
    }, 27);
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

  private setupInputHandling() {
    const app = browser.requireElement("app");

    document.addEventListener("keydown", () => {
      if (app) app.style.cursor = "none";
    });

    document.addEventListener("mousemove", () => {
      if (app) app.style.cursor = "";
    });
  }
}
