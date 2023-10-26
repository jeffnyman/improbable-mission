export class ResourceLoader {
  spriteSheet: HTMLImageElement;

  constructor() {
    console.log("Resource Loader Constructed");

    this.spriteSheet = new Image();
  }

  load() {
    console.log("| Loading Resources |");

    this.loadSprites();
  }

  loadSprites() {
    this.spriteSheet.src = "../images/missionSprites.png";

    this.spriteSheet.onload = () => {
      console.log("found the sprite sheet");
    };

    this.spriteSheet.onerror = () => {
      console.log("could not find sprite sheet");
    };
  }
}
