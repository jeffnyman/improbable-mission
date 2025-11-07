import { Game } from "./game";
import { audio } from "./components/audio";
import { utils } from "./utils/common";
import { graphics } from "./utils/graphics";
import { palette } from "./data/palette";
import { keyboard } from "./components/keyboard";
import type { ProgressCallback } from "./utils/types";
import type { PaletteArray } from "./utils/types";
import type { GameOptions } from "./utils/types";

export class Engine {
  private game: Game = new Game();

  private options: GameOptions = {
    palette: "vice",
    sound: "on",
  };

  private gameSprites: HTMLImageElement | null = null;
  private gameColors: PaletteArray | null = null;
  private sprites: Record<string, HTMLImageElement> = {};

  private canvas: HTMLCanvasElement | null = null;
  private baseSpriteCanvas: HTMLCanvasElement | null = null;
  private baseSpriteContext: CanvasRenderingContext2D | null = null;
  private baseSpriteData: ImageData | null = null;
  private baseSpritePixels: Uint8ClampedArray | null = null;
  private outputSpriteData: ImageData | null = null;

  private spriteWidth = 800;
  private spriteHeight = 600;

  private animationFrameTime = 0;
  private animationFrameCounter = 0;
  private scanInterval = -1;
  private scanFrameCounter = 0;

  async init() {
    audio.init();

    try {
      await this.loadGameAssets();
    } catch (error) {
      console.log((error as Error).message);
      utils.showError((error as Error).message);
      throw error;
    }

    this.game.init();

    this.setupOptions();
    this.processSprites();
    this.setupInterface();
    this.startProcessingLoop();
  }

  currentGameColors(): PaletteArray {
    return this.gameColors || palette.vice;
  }

  animationRoutine() {
    this.animationFrameCounter++;
    utils.setAnimationFrameCounter(this.animationFrameCounter);

    switch (this.game.currentScene()) {
      case "elevator":
        this.game.animateElevator();
        break;
    }

    // This handles the transition between elevator shafts
    // and the rooms.
    if (this.game.getTransitionState()) {
      graphics.rect(0, 100, 320, -this.game.getTransitionHeight(), 0);
      graphics.rect(0, 100, 320, +this.game.getTransitionHeight(), 0);
    }
  }

  animate() {
    const requestAnimFrame = window.requestAnimationFrame;

    requestAnimFrame((actualTime) => {
      if (actualTime - this.animationFrameTime > 30) {
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

  // CHECK: Do I need this?
  // Closing the browser automatically cleans up all intervals.
  // The game never restarts and the game state never resets.
  // Maybe when the game ends? Either in victory or defeat.
  stopScan() {
    if (this.scanInterval !== -1) {
      clearInterval(this.scanInterval);
      this.scanInterval = -1;
    }
  }

  scanRoutine() {
    this.scanFrameCounter++;
    utils.setScanFrameCounter(this.scanFrameCounter);

    // Empty the audio request queue.
    audio.emptyRequestQueue();

    if (this.game.getTransitionState()) {
      if (this.game.getTransitionState() == "closed") {
        this.game.setTransitionHeight(this.game.getTransitionHeight() + 7);

        if (this.game.getTransitionHeight() >= 120) {
          this.game.setTransitionState("open");
          this.game.transitionFunction?.();
        }
      } else if (this.game.getTransitionState() == "open") {
        this.game.setTransitionHeight(this.game.getTransitionHeight() - 7);

        if (this.game.getTransitionHeight() <= 0) {
          this.game.setTransitionState(false);
        }
      }
    } else {
      switch (this.game.currentScene()) {
        case "elevator":
          this.game.scanElevator();
          break;
      }
    }

    audio.playQueue();
  }

  scan() {
    this.scanInterval = setInterval(() => {
      if (this.game.isPaused()) return;
      this.scanRoutine();
    }, 27);
  }

  startProcessingLoop() {
    this.animate();
    this.scan();
  }

  setupInterface() {
    document.getElementById("loading")?.remove();
    document.getElementById("app")?.classList.remove("hidden");

    this.canvas = graphics.init(
      "game",
      () => this.currentGameColors(),
      () => this.sprites,
      () => this.options.palette,
    );

    this.setupResize();
    this.setupToolbar();
    this.setupOverlay();
    this.setupInputHandling();
  }

  processSprites() {
    if (!this.gameSprites) {
      throw new Error("Game sprites not loaded.");
    }

    this.baseSpriteCanvas = document.createElement("canvas");
    this.baseSpriteCanvas.width = this.spriteWidth;
    this.baseSpriteCanvas.height = this.spriteHeight;

    this.baseSpriteContext = graphics.getRenderingContext2D(
      this.baseSpriteCanvas,
    );

    this.baseSpriteContext.drawImage(this.gameSprites, 0, 0);

    this.baseSpriteData = this.baseSpriteContext.getImageData(
      0,
      0,
      this.spriteWidth,
      this.spriteHeight,
    );

    this.baseSpritePixels = this.baseSpriteData.data;

    this.outputSpriteData = this.baseSpriteContext.createImageData(
      this.spriteWidth,
      this.spriteHeight,
    );

    Object.entries(palette).forEach(([name, colors]) => {
      if (name !== "source") {
        this.swapSpritePalette(name, colors);
      }
    });
  }

  async loadGameAssets() {
    const state = {
      required: 1 + (audio.getContext() ? audio.getResources().length : 0),
      loaded: 0,
    };

    utils.setInterfaceText("required", String(state.required));

    const onProgress: ProgressCallback = () => {
      state.loaded++;
      utils.setInterfaceText("loaded", String(state.loaded));
    };

    // REMOVE: Temporary delay to simulate loading.
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await Promise.all([
      this.loadSprites(onProgress),
      audio.loadSounds(onProgress),
    ]);

    // REMOVE: Temporary delay to simulate loading.
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  async loadSprites(onProgress: ProgressCallback) {
    return new Promise<void>((resolve, reject) => {
      const gameSprites = new Image();

      gameSprites.onload = () => {
        this.gameSprites = gameSprites;
        onProgress?.();
        resolve();
      };

      gameSprites.onerror = () => {
        reject(new Error("Unable to load game sprites."));
      };

      gameSprites.src = `${import.meta.env.BASE_URL}images/sprites.png`;
    });
  }

  swapSpritePalette(name: string, targetPalette: PaletteArray) {
    if (!this.baseSpritePixels || !this.outputSpriteData) {
      throw new Error("Sprite data is not initialized.");
    }
    const newImageData = this.outputSpriteData;

    for (
      let pixelIndex = 0, totalPixels = this.baseSpritePixels.length;
      pixelIndex < totalPixels;
      pixelIndex += 4
    ) {
      const currentRed = this.baseSpritePixels[pixelIndex];
      const currentGreen = this.baseSpritePixels[pixelIndex + 1];
      const currentBlue = this.baseSpritePixels[pixelIndex + 2];

      for (let colorIndex = 0; colorIndex < 16; colorIndex++) {
        const sourceColor = palette.source[colorIndex];
        const sourceRed = parseInt(sourceColor[0] + sourceColor[1], 16);
        const sourceGreen = parseInt(sourceColor[2] + sourceColor[3], 16);
        const sourceBlue = parseInt(sourceColor[4] + sourceColor[5], 16);

        if (
          currentRed == sourceRed &&
          currentGreen == sourceGreen &&
          currentBlue == sourceBlue
        ) {
          const targetColor = targetPalette[colorIndex];

          newImageData.data[pixelIndex] = parseInt(
            targetColor[0] + targetColor[1],
            16,
          );

          newImageData.data[pixelIndex + 1] = parseInt(
            targetColor[2] + targetColor[3],
            16,
          );

          newImageData.data[pixelIndex + 2] = parseInt(
            targetColor[4] + targetColor[5],
            16,
          );

          newImageData.data[pixelIndex + 3] =
            this.baseSpritePixels[pixelIndex + 3];

          break;
        }
      }
    }

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = this.spriteWidth;
    outputCanvas.height = this.spriteHeight;

    const outputContext = graphics.getRenderingContext2D(outputCanvas);
    outputContext.putImageData(newImageData, 0, 0);

    this.sprites[name] = new Image();
    this.sprites[name].src = outputCanvas.toDataURL("image/png");
  }

  setupOptions() {
    if (localStorage.getItem("palette") === null) {
      localStorage.setItem("palette", "vice");
    }

    if (!audio.getContext()) {
      localStorage.setItem("sound", "off");
    } else if (localStorage.getItem("sound") === null) {
      localStorage.setItem("sound", "on");
    }

    const savedPalette = localStorage.getItem("palette");
    if (savedPalette) {
      this.options.palette = savedPalette;
    }

    const savedSound = localStorage.getItem("sound");
    if (savedSound) {
      this.options.sound = savedSound;
    }

    const paletteItem = document.querySelector(
      `.palette[data-palette="${this.options.palette}"]`,
    ) as HTMLElement;

    if (paletteItem) {
      this.applyPalette(this.options.palette);
      this.setActiveItem(paletteItem);
    }

    const soundItem = document.querySelector(
      `.sound-${this.options.sound}`,
    ) as HTMLElement;

    if (soundItem) {
      this.setActiveItem(soundItem);
    }
  }

  setupToolbar() {
    this.setupDossierItem();
    this.setupPaletteItems();
    this.setupSoundItems();
    this.setupFullscreenItem();
  }

  setupDossierItem() {
    document.getElementById("readDossier")?.addEventListener("click", () => {
      document.getElementById("overlay")?.classList.remove("hidden");
      document.getElementById("dossier")?.classList.remove("hidden");
      this.game.pause();
    });
  }

  setupPaletteItems() {
    const paletteItems = document.querySelectorAll<HTMLElement>(".palette");

    paletteItems.forEach((item) => {
      item.addEventListener("click", () => {
        const pal = item.getAttribute("data-palette");

        if (!pal) return;

        this.options.palette = pal;
        localStorage.setItem("palette", pal);

        this.applyPalette(pal);
        this.setActiveItem(item);
      });
    });
  }

  setupSoundItems() {
    const soundOnItem = document.querySelector(".sound-on") as HTMLElement;
    const soundOffItem = document.querySelector(".sound-off") as HTMLElement;

    if (soundOnItem) {
      soundOnItem.addEventListener("click", () => {
        this.options.sound = "on";
        localStorage.setItem("sound", "on");
        this.setActiveItem(soundOnItem);
      });
    }

    if (soundOffItem) {
      soundOffItem.addEventListener("click", () => {
        if (audio.getContext()) {
          audio.stopAllSounds();
        }

        this.options.sound = "off";
        localStorage.setItem("sound", "off");
        this.setActiveItem(soundOffItem);
      });
    }
  }

  setupFullscreenItem() {
    document.getElementById("fullscreen")?.addEventListener("click", () => {
      if (document.fullscreenElement) {
        this.fullScreenExit();
      } else {
        this.fullScreenEnter();
      }
    });
  }

  setupOverlay() {
    document.getElementById("overlay")?.addEventListener("click", () => {
      document.getElementById("overlay")?.classList.add("hidden");
      document.getElementById("dossier")?.classList.add("hidden");
      this.game.unpause();
    });
  }

  setupInputHandling() {
    keyboard.init();

    document.addEventListener("keydown", (evt) => {
      const overlay = document.getElementById("overlay");

      if (evt.code === "Escape" && !overlay?.classList.contains("hidden")) {
        overlay?.click();
      }

      if (
        (evt.code === "KeyP" || evt.code === "Pause") &&
        overlay?.classList.contains("hidden")
      ) {
        this.game.togglePause();
      }
    });
  }

  setupResize() {
    if (!this.canvas) {
      throw new Error("Canvas has not been not initialized.");
    }

    const canvas = this.canvas;
    const scaleFactor = 0.9;

    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const aspectRatio = 16 / 10;

      const toolbar = document.getElementById("toolbar");
      const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
      const availableHeight = windowHeight - toolbarHeight;

      let newWidth, newHeight;

      if (windowWidth / availableHeight > aspectRatio) {
        newHeight = availableHeight;
        newWidth = Math.round((availableHeight / 10) * 16);
      } else {
        newWidth = windowWidth;
        newHeight = Math.round((windowWidth * 10) / 16);
      }

      newWidth *= scaleFactor;
      newHeight *= scaleFactor;

      canvas.style.width = newWidth + "px";
      canvas.style.height = newHeight + "px";

      const dossier = document.getElementById("dossier");

      if (dossier) {
        dossier.style.height = newHeight - 40 + "px";
      }

      const offsetTop = `calc(50% + ${toolbarHeight / 2}px)`;
      canvas.style.top = offsetTop;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
  }

  applyPalette(paletteName: string) {
    const colors = (palette as Record<string, string[]>)[paletteName];

    if (!colors) return;

    this.gameColors = colors;

    const app = document.getElementById("app");

    if (app) {
      app.style.background = "#" + this.gameColors[0];
    }
  }

  setActiveItem(itemClicked: HTMLElement) {
    const container = itemClicked.closest(".item");

    if (container) {
      const allItems = container.querySelectorAll(".clickable");
      allItems.forEach((item) => item.classList.remove("active"));
    }

    itemClicked.classList.add("active");
  }

  fullScreenEnter() {
    const gameDiv = document.getElementById("game");
    if (gameDiv?.requestFullscreen) gameDiv.requestFullscreen();
  }

  fullScreenExit() {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}
