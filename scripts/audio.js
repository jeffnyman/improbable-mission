export class GameAudio {
  constructor() {
    this.context = null;
  }

  init() {
    try {
      this.context = new AudioContext();
    } catch (error) {
      console.error("Web Audio API not supported:", error);
      return;
    }
  }
}
