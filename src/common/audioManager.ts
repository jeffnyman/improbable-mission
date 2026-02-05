import { audit, log } from "../utils/logger";
import type { ActiveSound, AudioRequest } from "../types/audio";

class AudioManager {
  private context: AudioContext | null = null;

  // Holds all known audio source files.
  private resources: string[] = [];

  // Holds the decoded and buffered sounds.
  private sounds: Record<string, AudioBuffer> = {};

  // Holds requested sound effects for the current scan frame.
  // Cleared at the start of each frame, populated during scan,
  // played at end of frame.
  private queue: AudioRequest[] = [];

  // Holds the buffer of source objects for currently playing
  // sounds. This is used to stop sounds when needed (e.g., when
  // elevator stops moving).
  private activeSounds: ActiveSound[] = [];

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
   * Plays a sound immediately and returns its buffer source.
   * @returns AudioBufferSourceNode if played, false if context unavailable or sound not loaded
   */
  play(name: string): AudioBufferSourceNode | false {
    const soundSetting = localStorage.getItem("sound");

    if (soundSetting === "off") return false;

    if (!this.context || !this.hasSound(name)) return false;

    const source = this.context.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(this.context.destination);
    source.start(0);

    return source;
  }

  /**
   * Plays all sounds in the request queue and tracks them as active.
   * Called at the end of each scan frame to play all requested sounds.
   */
  playQueue() {
    const soundSetting = localStorage.getItem("sound");

    if (soundSetting === "off") return;

    for (const req of this.queue) {
      if (!req.name) continue;

      this.activeSounds.push({
        name: req.name,
        bufferSource: this.play(req.name),
      });
    }
  }

  /**
   * Stops all currently playing sounds and clears both the queue and active
   * sounds. Used when transitioning between sound states (e.g., elevator
   * stopping).
   */
  stopAllSounds() {
    if (!this.context) return;

    // Stop all currently playing sounds
    for (const activeSound of this.activeSounds) {
      if (activeSound.bufferSource) {
        activeSound.bufferSource.stop(0);
      }
    }

    // Clear both queue and active sounds
    this.queue = [];
    this.activeSounds = [];
  }

  /**
   * Clears the audio request queue.
   * Should be called at the start of each scan frame.
   */
  emptyRequestQueue() {
    this.queue = [];
  }

  /**
   * Requests a sound to be played in the current scan frame.
   * Prevents duplicate requests within the same frame.
   * @returns true if sound was queued, false if already queued or no context
   */
  request(audio: AudioRequest): boolean {
    if (!this.context) return false;
    if (localStorage.getItem("sound") === "off") return false;

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
