export class GameAudio {
  constructor() {
    console.log("[AUDIO] Construct: GameAudio");

    try {
      this.context = new AudioContext();
    } catch (error) {
      console.error("Web Audio API not supported:", error);
      this.context = null;
    }
  }
}
