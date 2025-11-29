import type { AudioRequest, ActiveSound } from "../utils/types";
import { log } from "../utils/logger";

export class GameAudio {
  private context: AudioContext | null = null;
  private resources: string[] = [];

  // Holds the decoded and buffered sounds.
  private sounds: Record<string, AudioBuffer> = {};

  // Hold requested sound effects in a given scan frame.
  // This should be emptied before every frame.
  private queue: AudioRequest[] = [];

  // Buffer source objects of sounds that have been played.
  // This needs to be stopped.
  private activeSounds: ActiveSound[] = [];

  constructor() {
    this.context = new AudioContext();
    this.resources = ["elevatorStart.ogg", "elevatorStop.ogg"];
  }

  getContext() {
    return this.context;
  }

  emptyRequestQueue() {
    this.queue = [];
  }

  playQueue() {
    for (const req of this.queue) {
      if (!req.name) continue;

      this.activeSounds.push({
        name: req.name,
        bufferSource: this.play(req.name),
      });
    }
  }

  play(name: string): AudioBufferSourceNode | false {
    let source: AudioBufferSourceNode | undefined;

    if (this.context) {
      source = this.context.createBufferSource();
      source.buffer = this.sounds[name];
      source.connect(this.context.destination);

      const bufferSource = source;
      bufferSource.start(0);

      return bufferSource;
    }

    return false;
  }

  request(audio: AudioRequest) {
    if (!this.context) return;

    for (const queuedAudio of this.queue) {
      if (queuedAudio.name === audio.name) return;
    }

    this.queue.push(audio);

    return true;
  }

  stopAllSounds() {
    if (!this.context) return;

    for (const activeSound of this.activeSounds) {
      if (activeSound.bufferSource) {
        activeSound.bufferSource.stop(0);
      }
    }

    this.queue = [];
    this.activeSounds = [];
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
