import { checkBrowserCapabilities } from "./browserCheck";

export class Engine {
  constructor() {
    this.loadedResources = 0;
    this.requiredResources = 1;

    // Canvas properties
    this.spriteWidth = 800;
    this.spriteHeight = 600;

    // Sprite management
    this.baseSpriteCanvas = null;
    this.baseSpriteContext = null;
    this.baseSpriteData = null;
    this.baseSpriteDataPix = null;
    this.baseSpriteImageDataCreated = null;
  }

  async init() {
    try {
      // Redirect to the landing page if the URL has a query string.
      if (document.location.search !== "") {
        window.history.pushState(false, false, "/");
      }

      checkBrowserCapabilities();
      await this.loadResources();
    } catch (error) {
      console.error("Initialization failed:", error);
      return;
    }
  }

  async loadResources() {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const updateProgress = () => {
      const loadedElement = document.getElementById("loaded-resources");
      if (loadedElement) {
        loadedElement.textContent = this.loadedResources;
      }
    };

    const baseSprites = new Image();

    await new Promise((resolve, reject) => {
      baseSprites.onload = () => {
        this.baseSpriteCanvas = document.createElement("canvas");
        this.baseSpriteCanvas.width = this.spriteWidth;
        this.baseSpriteCanvas.height = this.spriteHeight;

        this.baseSpriteContext = this.baseSpriteCanvas.getContext("2d");
        this.baseSpriteContext.drawImage(baseSprites, 0, 0);

        this.baseSpriteData = this.baseSpriteContext.getImageData(
          0,
          0,
          this.spriteWidth,
          this.spriteHeight,
        );

        this.baseSpriteDataPix = this.baseSpriteData.data;
        this.baseSpriteImageDataCreated =
          this.baseSpriteContext.createImageData(
            this.spriteWidth,
            this.spriteHeight,
          );

        this.loadedResources++;
        updateProgress();

        setTimeout(() => {
          document.getElementById("loading")?.classList.add("hidden");
        }, 200);

        resolve();
      };

      baseSprites.onerror = (error) => {
        console.error("Image failed to load:", error);
        console.error("Image src was:", baseSprites.src);
        reject();
      };

      baseSprites.src = "/images/missionSprites.png";
    });
  }
}
