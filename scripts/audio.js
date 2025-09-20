export class GameAudio {
  constructor() {
    this.engine = null;
    this.sounds = {};

    try {
      this.context = new AudioContext();
    } catch (error) {
      console.error("Web Audio API not supported:", error);
      this.context = null;
    }

    this.resources = ["anotherVisitor.ogg"];
  }

  async init(engine) {
    this.engine = engine;

    if (this.context) {
      this.engine.requiredResources += this.resources.length;
    }

    return Promise.resolve();
  }

  async loadResource(index = 0) {
    return new Promise((resolve, reject) => {
      if (!this.context || index >= this.resources.length) {
        resolve();
        return;
      }

      const fileName = this.resources[index];
      const fullPath = `${import.meta.env.BASE_URL}audio/${fileName}`;
      const name = fileName.split(".")[0];

      const request = new XMLHttpRequest();
      request.open("GET", fullPath, true);
      request.responseType = "arraybuffer";

      const handleComplete = () => {
        if (this.engine) {
          this.engine.loadedResources++;
        }

        // Load next resource
        if (index + 1 < this.resources.length) {
          this.loadResource(index + 1)
            .then(resolve)
            .catch(reject);
        } else {
          resolve();
        }
      };

      request.onload = () => {
        if (request.status === 200) {
          this.context.decodeAudioData(
            request.response,
            (buffer) => {
              this.sounds[name] = buffer;
              console.log(`✓ Loaded audio: ${name}`);
              handleComplete(true);
            },
            (err) => {
              console.error(
                `✗ Error decoding audio data for ${fileName}:`,
                err,
              );
              handleComplete(false);
            },
          );
        } else {
          console.error(
            `✗ Failed to load audio file: ${fileName}, status: ${request.status}`,
          );
          handleComplete(false);
        }
      };

      request.onerror = () => {
        console.error(`✗ Network error loading audio file: ${fileName}`);
        handleComplete(false);
      };

      request.send();
    });
  }
}
