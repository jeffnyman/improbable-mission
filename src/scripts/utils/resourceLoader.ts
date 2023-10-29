import { MissionAudio } from "../audio";

export class ResourceLoader {
  audio: MissionAudio;
  spriteSheet: HTMLImageElement;
  neededResources: number;
  loadedResources: number;
  audioResources: string[] = [];
  sounds: { [key: string]: AudioBuffer };

  constructor() {
    console.log("Resource Loader Constructed");

    this.audio = new MissionAudio();
    this.spriteSheet = new Image();
    this.neededResources = 0;
    this.loadedResources = 0;
    this.audioResources = [];
    this.sounds = {};

    if (this.audio.context) {
      this.gatherAudioResources();
    }
  }

  load(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("| Loading Resources |");

      this.loadSprites()
        .then(() => {
          console.log("-- Load Sounds after Sprites");
          return this.loadSounds();
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error("Error occurred during resource loading:", error);
          reject(error);
        });
    });
  }

  loadSprites(): Promise<void> {
    console.log("** Loading Sprites");

    return new Promise<void>((resolve, reject) => {
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
    });
  }

  async loadSounds() {
    console.log("** Loading Sounds");

    if (!this.audio.context) {
      return;
    }

    for (let i = 0; i < this.audioResources.length; i++) {
      const resourceFileName = this.audioResources[i];
      const resourceName = resourceFileName.split(".")[0];

      // Initiate an asynchronous request to fetch an audio resource.
      // The response will contain the audio data in the form of an
      // array buffer that can be processed further.

      const request = new XMLHttpRequest();
      request.open("GET", "../sounds/" + resourceFileName, true);
      request.responseType = "arraybuffer";

      try {
        const response = await new Promise<ArrayBuffer>((resolve, reject) => {
          // Assuming a resource was loaded, that resource is decoded and
          // the decoded data is stored. The logic keeps track of how many
          // resources have been loaded.

          request.onload = () => {
            if (request.status === 200 && request.response) {
              resolve(request.response);
            } else {
              reject(
                new Error(
                  `ERROR: Cannot Load Mission Audio: ${request.responseURL}`,
                ),
              );
            }
          };

          // This statement is crucial! This is what actually sends the
          // XMLHttpRequest and fetches the audio resource. This should
          // trigger the onload event, which then starts the process of
          // decoding and loading the resource.

          request.send();
        });

        const buffer = await this.audio.context?.decodeAudioData(response);

        if (buffer) {
          this.sounds[resourceName] = buffer;
          this.loadedResources++;
          this.updateLoadedResources();
        }
      } catch (error) {
        throw new Error(
          `ERROR: Cannot Load Mission Audio: ${request.responseURL}`,
        );
      }
    }
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

  gatherAudioResources() {
    this.audioResources.push(
      "anotherVisitor.ogg",
      "destroyHim.ogg",
      "dieByZap.ogg",
      "droid.ogg",
      "droidTurn.ogg",
      "elevatorStart.ogg",
      "elevatorStop.ogg",
      "falling.ogg",
      "hahaha.ogg",
      "inLine.ogg",
      "jumpLeft.ogg",
      "jumpRight.ogg",
      "missionAccomplished.ogg",
      "nonono.ogg",
      "stepLeft.ogg",
      "stepRight.ogg",
    );

    for (var i = 1; i <= 5; i++) {
      this.audioResources.push("beep" + i + ".ogg");
    }

    for (var i = 1; i <= 2; i++) {
      this.audioResources.push("dial" + i + ".ogg");
    }

    for (var i = 1; i <= 14; i++) {
      this.audioResources.push("organTone" + i + ".ogg");
    }

    this.neededResources += this.audioResources.length;
    this.updateNeededResources();
  }
}
