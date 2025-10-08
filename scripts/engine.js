import { checkBrowser } from "./checkBrowser";
import { loadResources } from "./loadResources";
import { Game } from "./game";
import { GameAudio } from "./audio";
import { palette } from "./palette";

export class Engine {
  constructor() {
    this.options = {};

    // Canvas properties
    this.canvas = null;
    this.ctx = null;
    this.scaleFactor = 0.89;

    // Sprite management
    this.gameSprites = null;
    this.sprites = {};
    this.spriteWidth = 800;
    this.spriteHeight = 600;
    this.baseSpriteCanvas = null;
    this.baseSpriteContext = null;
    this.baseSpriteData = null;
    this.baseSpritePixels = null;
    this.outputSpriteData = null;

    // Animation and scan properties
    this.animationFrameTime = 0;
    this.animationFrameCounter = 0;

    // Color properties
    this.gameColors = palette.vice;

    // Subsystems
    this.audio = new GameAudio();
    this.game = new Game();
  }

  async init() {
    this.audio.init();

    checkBrowser();
    await loadResources(this);

    this.setupSpriteProcessing();
    this.setupToolbar();
    this.setupOptions();
    this.setupInterface();
    this.setupInterfaceResizing();
    this.setupKeyHandling();

    this.game.init();

    this.startProcessingLoop();
  }

  startProcessingLoop() {
    this.animate();
    this.scan();
  }

  animationRoutine() {
    this.animationFrameCounter++;
  }

  animate() {
    const requestAnimFrame = window.requestAnimationFrame;

    requestAnimFrame((actualTime) => {
      if (this.game.pause) {
        this.animate();
        return;
      }

      if (actualTime - this.animationFrameTime > 30) {
        this.animationFrameTime = actualTime;
        this.animationRoutine();
      }

      this.animate();
    });
  }

  scan() {}

  setupSpriteProcessing() {
    this.baseSpriteCanvas = document.createElement("canvas");
    this.baseSpriteCanvas.width = this.spriteWidth;
    this.baseSpriteCanvas.height = this.spriteHeight;

    this.baseSpriteContext = this.baseSpriteCanvas.getContext("2d");
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

  setupOptions() {
    if (localStorage.getItem("palette") === null) {
      localStorage.setItem("palette", "vice");
    }

    this.options.palette = localStorage.getItem("palette");

    const paletteButton = document.querySelector(
      `.palette[data-palette="${this.options.palette}"]`,
    );

    if (paletteButton) {
      paletteButton.click();
    }

    if (!this.audio.context) {
      localStorage.setItem("sound", "off");
    }

    if (localStorage.getItem("sound") === null) {
      localStorage.setItem("sound", "on");
    }

    this.options.sound = localStorage.getItem("sound");

    const soundButton = document.querySelector(
      `.setting-sound-${this.options.sound}`,
    );

    if (soundButton) {
      soundButton.click();
    }
  }

  setupInterface() {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("toolbar").classList.remove("hidden");

    document.getElementById("overlay").addEventListener("click", () => {
      document.getElementById("overlay").classList.add("hidden");
      document.getElementById("dossier").classList.add("hidden");
      this.game.togglePause(false);
    });

    document.getElementById("game").classList.remove("hidden");

    this.canvas = document.getElementById("missionCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
  }

  setupToolbar() {
    document.getElementById("dossier-button").addEventListener("click", () => {
      document.getElementById("overlay").classList.remove("hidden");
      document.getElementById("dossier").classList.remove("hidden");
      this.game.togglePause(true);
    });

    const paletteButtons = document.querySelectorAll(".palette");

    paletteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const pal = button.getAttribute("data-palette");

        this.options.palette = pal;
        this.gameColors = palette[pal];
        localStorage.setItem("palette", pal);

        document.getElementById("app").style.background =
          "#" + this.gameColors[0];

        this.setActiveButton(button);
      });
    });

    const soundOnButton = document.querySelector(".setting-sound-on");
    const soundOffButton = document.querySelector(".setting-sound-off");

    soundOnButton.addEventListener("click", () => {
      if (this.audio.context) {
        this.options.sound = "on";
        localStorage.setItem("sound", "on");
        this.setActiveButton(soundOnButton);
      }
    });

    soundOffButton.addEventListener("click", () => {
      if (this.audio.context) {
        this.options.sound = "off";
        localStorage.setItem("sound", "off");
        this.setActiveButton(soundOffButton);
      }
    });

    document.getElementById("fullscreen").addEventListener("click", () => {
      if (document.fullscreenElement) {
        this.exitFullScreen();
      } else {
        this.enterFullScreen();
      }
    });
  }

  setupKeyHandling() {
    document.addEventListener("keydown", (evt) => {
      var overlay = document.getElementById("overlay");

      if (evt.code === "Escape" && !overlay.classList.contains("hidden")) {
        overlay.click();
      }
    });
  }

  setupInterfaceResizing() {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const aspectRatio = 16 / 10;

      // Get the toolbar element and its height
      const toolbar = document.getElementById("toolbar");
      const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;

      // Calculate available height (subtract toolbar height)
      const availableHeight = windowHeight - toolbarHeight;

      let newWidth, newHeight;

      // Use availableHeight instead of windowHeight for calculations
      if (windowWidth / availableHeight > aspectRatio) {
        newHeight = availableHeight;
        newWidth = Math.round((availableHeight / 10) * 16);
      } else {
        newWidth = windowWidth;
        newHeight = Math.round((windowWidth * 10) / 16);
      }

      newWidth *= this.scaleFactor;
      newHeight *= this.scaleFactor;

      this.canvas.style.width = newWidth + "px";
      this.canvas.style.height = newHeight + "px";

      document.getElementById("dossier").style.height = newHeight - 40 + "px";

      // Adjust the vertical centering to account for toolbar
      // The canvas uses transform: translate(-50%, -50%) with top: 50%
      // So AI need to shift it down by half the toolbar height
      const offsetTop = `calc(50% + ${toolbarHeight / 2}px)`;
      this.canvas.style.top = offsetTop;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
  }

  swapSpritePalette(name, targetPalette) {
    var newImageData = this.outputSpriteData;

    for (
      var pixelIndex = 0, totalPixels = this.baseSpritePixels.length;
      pixelIndex < totalPixels;
      pixelIndex += 4
    ) {
      var currentRed = this.baseSpritePixels[pixelIndex];
      var currentGreen = this.baseSpritePixels[pixelIndex + 1];
      var currentBlue = this.baseSpritePixels[pixelIndex + 2];

      for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
        var sourceColor = palette.source[colorIndex];
        var sourceRed = parseInt(sourceColor[0] + sourceColor[1], 16);
        var sourceGreen = parseInt(sourceColor[2] + sourceColor[3], 16);
        var sourceBlue = parseInt(sourceColor[4] + sourceColor[5], 16);

        if (
          currentRed == sourceRed &&
          currentGreen == sourceGreen &&
          currentBlue == sourceBlue
        ) {
          var targetColor = targetPalette[colorIndex];

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

    var outputCanvas = document.createElement("canvas");
    outputCanvas.width = this.spriteWidth;
    outputCanvas.height = this.spriteHeight;

    var outputContext = outputCanvas.getContext("2d");
    outputContext.putImageData(newImageData, 0, 0);

    this.sprites[name] = new Image();
    this.sprites[name].src = outputCanvas.toDataURL("image/png");
  }

  setActiveButton(button) {
    const item = button.closest(".item");

    if (item) {
      const allButtons = item.querySelectorAll(".clickable");
      allButtons.forEach((btn) => btn.classList.remove("active"));
    }

    button.classList.add("active");
  }

  enterFullScreen() {
    var gameDiv = document.getElementById("game");
    if (gameDiv.requestFullscreen) gameDiv.requestFullscreen();
  }

  exitFullScreen() {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}
