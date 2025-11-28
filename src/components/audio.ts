import type { AudioRequest } from "../utils/types";
import { log } from "../utils/logger";

export class GameAudio {
  private context: AudioContext | null = null;
  private resources: string[] = [];

  // Holds the decoded and buffered sounds.
  private sounds: Record<string, AudioBuffer> = {};

  // Hold requested sound effects in a given scan frame.
  // This should be emptied before every frame.
  private queue: AudioRequest[] = [];

  constructor() {
    this.context = new AudioContext();
    this.resources = ["elevatorStart.ogg", "elevatorStop.ogg"];
  }

  getContext() {
    return this.context;
  }

  request(audio: AudioRequest) {
    log(`Requesting: ${audio.name}`);

    if (!this.context) return;

    for (const queuedAudio of this.queue) {
      if (queuedAudio.name === audio.name) return;
    }

    this.queue.push(audio);

    return true;
  }

  async loadSounds() {
    for (const audioFile of this.resources) {
      try {
        const name = audioFile.split(".")[0];
        const response = await fetch(
          `${import.meta.env.BASE_URL}audio/${audioFile}`,
        );
        const arrayBuffer = await response.arrayBuffer();

        if (this.context) {
          this.sounds[name] = await this.context.decodeAudioData(arrayBuffer);
        }
      } catch (error) {
        console.warn(`Error loading audio file: ${audioFile}`, error);
      }
    }

    log(
      `Loaded ${Object.keys(this.sounds).length}/${this.resources.length} audio files`,
    );
  }
}

export const audio: GameAudio = new GameAudio();
