export class GameAudio {
  constructor() {
    console.log("[AUDIO] Construct: GameAudio");

    this.engine = null;
    this.sounds = {};
    this.resources = [
      "anotherVisitor.ogg",
      "elevatorStart.ogg",
      "elevatorStop.ogg",
      "stepLeft.ogg",
      "stepRight.ogg",
      "jumpLeft.ogg",
      "jumpRight.ogg",
      "droid.ogg",
      "droidTurn.ogg",
      "inLine.ogg",
      "falling.ogg",
      "dieByZap.ogg",
      "destroyHim.ogg",
      "hahaha.ogg",
      "nonono.ogg",
      "missionAccomplished.ogg",
    ];

    for (let i = 1; i <= 2; i++) {
      this.resources.push(`dial${i}.ogg`);
    }

    for (let i = 1; i <= 5; i++) {
      this.resources.push(`beep${i}.ogg`);
    }

    for (let i = 1; i <= 5; i++) {
      this.resources.push(`zap${i}.ogg`);
    }

    for (let i = 1; i <= 14; i++) {
      this.resources.push(`organTone${i}.ogg`);
    }
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
