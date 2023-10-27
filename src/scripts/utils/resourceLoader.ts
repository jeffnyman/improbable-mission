export class ResourceLoader {
  spriteSheet: HTMLImageElement;
  neededResources: number;

  constructor() {
    console.log("Resource Loader Constructed");

    this.spriteSheet = new Image();
    this.neededResources = 0;
  }

  load() {
    console.log("| Loading Resources |");

    this.loadSprites();
  }

  loadSprites() {
    this.neededResources += 1;
    this.updatedNeededResources();

    this.spriteSheet.src = "../images/missionSprites.png";

    this.spriteSheet.onload = () => {
      console.log("found the sprite sheet");
    };

    this.spriteSheet.onerror = () => {
      console.log("could not find sprite sheet");
    };
  }

  updatedNeededResources() {
    const neededResourcesSpan =
      document.querySelector<HTMLSpanElement>("#needed-resources")!;

    neededResourcesSpan.textContent = `${this.neededResources}`;
  }
}
