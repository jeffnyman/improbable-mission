export class GameAudio {
  private context: AudioContext | null = null;

  constructor() {
    this.context = new AudioContext();
  }

  getContext() {
    return this.context;
  }
}

export const audio: GameAudio = new GameAudio();
