export class ResourceLoader {
  spriteSheet: HTMLImageElement;
  neededResources: number;
  loadedResources: number;

  constructor() {
    console.log("Resource Loader Constructed");

    this.spriteSheet = new Image();
    this.neededResources = 0;
    this.loadedResources = 0;
  }

  load() {
    console.log("| Loading Resources |");

    this.loadSprites();
  }

  loadSprites() {
    this.neededResources += 1;
    this.updateNeededResources();

    this.spriteSheet.src = "../images/missionSprites.png";

    this.spriteSheet.onload = () => {
      console.log("found the sprite sheet");

      this.loadedResources += 1;

      const loadedResourcesSpan =
        document.querySelector<HTMLSpanElement>("#loaded-resources")!;

      loadedResourcesSpan.textContent = `${this.loadedResources}`;
    };

    this.spriteSheet.onerror = () => {
      console.log("could not find sprite sheet");
    };
  }

  updateNeededResources() {
    const neededResourcesSpan =
      document.querySelector<HTMLSpanElement>("#needed-resources")!;

    neededResourcesSpan.textContent = `${this.neededResources}`;
  }
}
