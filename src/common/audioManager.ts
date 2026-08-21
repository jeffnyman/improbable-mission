import { audit, log } from "../utils/logger";
import {
  originalAudioNames,
  originalAudioPath,
  audioTrim,
} from "../data/audioManifest";
import type { OriginalAudioName } from "../data/audioManifest";
import type { ActiveSound, AudioRequest } from "../types/audio";

/**
 * How much to lift the whole sound set. The original's samples were
 * ripped without normalisation and average about 17 dB below a modern
 * mastered track, which left them sitting under the crawl music instead
 * of alongside it. This closes most of that gap; the rest comes from
 * the crawl playing at a lower volume (see ui/missionCrawl.ts).
 *
 * The ceiling on this number is the loudest single sample: die.by.zap
 * peaks at -8.9 dBFS, so 2.2 puts its peak at 0.79 and leaves a little
 * room for a second sound before the output clamps at 1.0.
 */
const MASTER_GAIN = 2.2;

class AudioManager {
  private context: AudioContext | null = null;

  // Every sound plays through this, so there is exactly one place to
  // set the overall level — and one place for a volume control to
  // reach if this ever grows beyond the on/off toggle.
  private master: GainNode | null = null;

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
    try {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = MASTER_GAIN;
      this.master.connect(this.context.destination);
    } catch (error) {
      audit("AudioContext not available in this environment", error);
      this.context = null;
      this.master = null;
    }
  }

  isAvailable(): boolean {
    return this.context !== null;
  }

  /**
   * Resumes the AudioContext. Browsers create contexts in a
   * suspended state until a user gesture; the engine calls this
   * from the ACCEPT THE MISSION click chain so the intro speech
   * can actually play.
   */
  unlock() {
    if (this.context && this.context.state === "suspended") {
      this.context.resume();
    }
  }

  hasSound(name: string): boolean {
    return name in this.sounds;
  }

  getContext(): AudioContext | null {
    return this.context;
  }

  /**
   * Plays a sound and returns its buffer source. An offset (in
   * milliseconds) delays the start, matching the original's
   * scheduling for speech and dial tones.
   * @returns AudioBufferSourceNode if played, false if context unavailable or sound not loaded
   */
  play(name: string, loop = false, offset = 0): AudioBufferSourceNode | false {
    const soundSetting = localStorage.getItem("sound");

    if (soundSetting === "off") return false;

    if (!this.context || !this.hasSound(name)) return false;

    const source = this.context.createBufferSource();
    source.buffer = this.sounds[name];
    source.loop = loop;

    // A few sounds carry their own correction on top of the master
    // gain (see audioTrim); the rest go straight to the bus. The cast
    // is because play() takes a plain string — see the note on
    // OriginalAudioName in the manifest.
    const trim = audioTrim[name as OriginalAudioName];

    if (this.master && trim !== undefined) {
      const gain = this.context.createGain();
      gain.gain.value = trim;
      source.connect(gain);
      gain.connect(this.master);
    } else {
      source.connect(this.master ?? this.context.destination);
    }

    if (!offset) {
      source.start(0);
    } else {
      setTimeout(() => {
        if (localStorage.getItem("sound") === "off") return;
        source.start(0);
      }, offset);
    }

    return source;
  }

  /**
   * Plays all sounds in the request queue and tracks them as
   * active. Called at the end of each scan frame to play all
   * requested sounds.
   */
  playQueue() {
    const soundSetting = localStorage.getItem("sound");

    if (soundSetting === "off") return;

    for (const req of this.queue) {
      if (!req.name) continue;

      this.activeSounds.push({
        name: req.name,
        bufferSource: this.play(req.name, req.loop, req.offset),
      });
    }
  }

  /**
   * Stops all currently playing sounds and clears both the queue
   * and active sounds. Used when transitioning between sound states
   * (e.g., elevator stopping).
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
   * Stops the first currently playing zap sound. Robots start
   * their zap sounds as loops, so each robot that stops zapping
   * retires exactly one of them.
   */
  stopOneZapSound() {
    if (!this.context) return;

    for (const activeSound of this.activeSounds) {
      if (activeSound.name.startsWith("zap")) {
        if (activeSound.bufferSource) {
          activeSound.bufferSource.stop(0);
        }
        activeSound.name = "deleted";
        break;
      }
    }
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

    // Prevent duplicate sounds in the same frame. Requests with an
    // offset are exempt so the same sound can be scheduled more
    // than once (the original allows this for dial tones).
    for (const queuedAudio of this.queue) {
      if (queuedAudio.name === audio.name && !audio.offset) return false;
    }

    this.queue.push(audio);

    return true;
  }

  /**
   * Loads the complete original sound set from the manifest in
   * parallel. Failed files are logged but don't prevent other
   * files from loading.
   */
  async loadSounds() {
    await Promise.all(
      originalAudioNames.map(async (name) => {
        try {
          const path = originalAudioPath(name).replace(/^\//, "");
          const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
          const arrayBuffer = await response.arrayBuffer();

          if (this.context) {
            this.sounds[name] = await this.context.decodeAudioData(arrayBuffer);
          }
        } catch (error) {
          audit(`Error loading audio file: ${name}`, error);
        }
      }),
    );

    log(
      `Loaded ${Object.keys(this.sounds).length}/${originalAudioNames.length} audio files`,
    );
  }
}

export const audio: AudioManager = new AudioManager();
