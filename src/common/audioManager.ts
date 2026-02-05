import { audit, log } from "../utils/logger";
import type { AudioRequest } from "../types/audio";

class AudioManager {
  private context: AudioContext | null = null;

  // Holds all known audio source files.
  private resources: string[] = [];

  // Holds the decoded and buffered sounds.
  private sounds: Record<string, AudioBuffer> = {};

  // Holds requested sound effects in a given scan frame.
  private queue: AudioRequest[] = [];

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
   * Requests a sound to be played in the current scan frame.
   * Prevents duplicate requests within the same frame.
   * @returns true if sound was queued, false if already queued or no context
   */
  request(audio: AudioRequest): boolean {
    if (!this.context) return false;

    // Prevent duplicate sounds in the same frame
    for (const queuedAudio of this.queue) {
      if (queuedAudio.name === audio.name) return false;
    }

    this.queue.push(audio);

    return true;
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
