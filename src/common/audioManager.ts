import { audit, log } from "../utils/logger";

class AudioManager {
  private context: AudioContext | null = null;

  // Holds all known audio source files.
  private resources: string[] = [];

  // Holds the decoded and buffered sounds.
  private sounds: Record<string, AudioBuffer> = {};

  constructor() {
    this.context = new AudioContext();
    this.resources = ["elevator.start.ogg", "elevator.stop.ogg"];
  }

  isAvailable(): boolean {
    return this.context !== null;
  }

  hasSound(name: string): boolean {
    return name in this.sounds;
  }

  getContext(): AudioContext | null {
    return this.context;
  }

  /**
   * Loads all audio resources in parallel. Failed files are
   * logged but don't prevent other files from loading.
   */
  async loadSounds() {
    await Promise.all(
      this.resources.map(async (audioFile) => {
        try {
          const name = audioFile.replace(/\.[^.]+$/, "");
          const response = await fetch(
            `${import.meta.env.BASE_URL}audio/${audioFile}`,
          );
          const arrayBuffer = await response.arrayBuffer();

          if (this.context) {
            this.sounds[name] = await this.context.decodeAudioData(arrayBuffer);
          }
        } catch (error) {
          audit(`Error loading audio file: ${audioFile}`, error);
        }
      }),
    );

    log(
      `Loaded ${Object.keys(this.sounds).length}/${this.resources.length} audio files`,
    );
  }
}

export const audio: AudioManager = new AudioManager();
