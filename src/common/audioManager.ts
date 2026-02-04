import { audit } from "../utils/logger";

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

  async loadSounds() {
    for (const audioFile of this.resources) {
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
    }
  }
}

export const audio: AudioManager = new AudioManager();
