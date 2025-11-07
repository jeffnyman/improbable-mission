import { utils } from "../utils/common";
import type { ProgressCallback } from "../utils/types";

interface AudioRequest {
  name: string;
  offset?: number;
  loop?: boolean;
}

interface ActiveSound {
  name: string;
  bufferSource: AudioBufferSourceNode | false;
}

export class GameAudio {
  private resources: string[] = [];
  private context: AudioContext | null = null;

  // Holds the decoded and buffered sounds.
  private sounds: Record<string, AudioBuffer> = {};

  // Hold requested sound effects in a given scan frame.
  // This should be emptied before every frame.
  private queue: AudioRequest[] = [];

  // Buffer source objects of sounds that have been played.
  // This needs to be stopped.
  private activeSounds: ActiveSound[] = [];

  init() {
    this.resources = [
      "elevatorStart.ogg",
      "elevatorStop.ogg",
      "stepLeft.ogg",
      "stepRight.ogg",
      "jumpLeft.ogg",
      "jumpRight.ogg",
    ];

    try {
      this.context = new AudioContext();
    } catch (error) {
      utils.showError((error as Error).message);
      throw error;
    }
  }

  getContext() {
    return this.context;
  }

  getResources() {
    return this.resources;
  }

  emptyRequestQueue() {
    this.queue = [];
  }

  playQueue() {
    const soundSetting = localStorage.getItem("sound");

    if (soundSetting === "off") return false;

    for (const req of this.queue) {
      if (!req.name) continue;
      if (req.loop === undefined) req.loop = false;
      if (req.offset === undefined) req.offset = 0;

      this.activeSounds.push({
        name: req.name,
        bufferSource: this.play(req.name, req.loop, req.offset),
      });
    }

    return true;
  }

  play(
    name: string,
    loop: boolean,
    offset: number,
  ): AudioBufferSourceNode | false {
    let source: AudioBufferSourceNode | undefined;
    const soundSetting = localStorage.getItem("sound");

    if (soundSetting === "off") return false;

    if (this.context) {
      source = this.context.createBufferSource();

      source.buffer = this.sounds[name];
      source.loop = loop;
      source.connect(this.context.destination);

      const bufferSource = source;

      if (!offset) {
        bufferSource.start(0);
      } else {
        setTimeout(() => {
          bufferSource.start(0);
        }, offset);
      }

      return bufferSource;
    }

    return false;
  }

  request(audio: AudioRequest) {
    if (!this.context) return;

    for (const queuedAudio of this.queue) {
      if (queuedAudio.name === audio.name && !audio.offset) return;
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

  async loadSounds(onProgress: ProgressCallback) {
    for (const audioFile of this.resources) {
      const name = audioFile.split(".")[0];
      const response = await fetch(
        `${import.meta.env.BASE_URL}audio/${audioFile}`,
      );

      const arrayBuffer = await response.arrayBuffer();

      if (this.context) {
        this.sounds[name] = await this.context.decodeAudioData(arrayBuffer);
      }

      if (onProgress) onProgress();

      // Random delay for retro feel.
      const delay = Math.random() * 100 + 50;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export const audio = new GameAudio();
