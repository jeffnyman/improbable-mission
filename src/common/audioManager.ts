class AudioManager {
  private context: AudioContext | null = null;

  constructor() {
    this.context = new AudioContext();
  }

  isAvailable(): boolean {
    return this.context !== null;
  }

  getContext(): AudioContext | null {
    return this.context;
  }
}

export const audio: AudioManager = new AudioManager();
