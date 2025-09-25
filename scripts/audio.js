export class GameAudio {
  constructor() {
    console.log("[AUDIO] Construct: GameAudio");

    this.engine = null;
    this.sounds = {};
    this.resources = ["anotherVisitor.ogg"];
  }

  init(engine) {
    console.log("[AUDIO] Initialize: GameAudio");

    this.engine = engine;

    try {
      this.context = new AudioContext();
    } catch (error) {
      console.error("Web Audio API not supported:", error);
      this.context = null;
    }

    if (this.context) {
      this.engine.requiredResources += this.resources.length;
    }
  }
}
