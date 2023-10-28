import { MissionAudio } from "../audio";

export class ResourceLoader {
  audio: MissionAudio;
  spriteSheet: HTMLImageElement;
  neededResources: number;
  loadedResources: number;

  constructor() {
    console.log("Resource Loader Constructed");

    this.audio = new MissionAudio();
    this.spriteSheet = new Image();
    this.neededResources = 0;
    this.loadedResources = 0;
  }

  load(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("| Loading Resources |");

      this.loadSprites(resolve, reject);
    });
  }

  loadSprites(resolve: () => void, reject: (error: Error) => void) {
    this.neededResources++;
    this.updateNeededResources();

    this.spriteSheet.src = "../images/missionSprites.png";

    this.spriteSheet.onload = () => {
      console.log("found the sprite sheet");

      this.loadedResources++;
      this.updateLoadedResources();

      resolve();
    };

    this.spriteSheet.onerror = () => {
      console.log("could not find sprite sheet");

      const loadingDiv = document.querySelector<HTMLDivElement>("#loading")!;
      loadingDiv.classList.add("hidden");

      const errorDiv = document.querySelector<HTMLDivElement>("#error")!;
      errorDiv.classList.remove("hidden");

      const problemParagraph = errorDiv.querySelector("p")!;
      problemParagraph.innerHTML = "Unable to load game sprite sheet.";

      reject(new Error("ERROR: Cannot Load Mission Sprites"));
    };
  }

  updateNeededResources() {
    const neededResourcesSpan =
      document.querySelector<HTMLSpanElement>("#needed-resources")!;

    neededResourcesSpan.textContent = `${this.neededResources}`;
  }

  updateLoadedResources() {
    const loadedResourcesSpan =
      document.querySelector<HTMLSpanElement>("#loaded-resources")!;

    setTimeout(() => {
      loadedResourcesSpan.textContent = `${this.loadedResources}`;
    }, 1000);
  }
}
