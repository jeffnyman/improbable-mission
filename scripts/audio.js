export class GameAudio {
  constructor() {
    console.log("[AUDIO] Construct: GameAudio");

    this.sounds = {};
    this.resources = ["anotherVisitor.ogg"];

    try {
      this.context = new AudioContext();
    } catch (error) {
      console.error("Web Audio API not supported:", error);
      this.context = null;
    }
  }
}
