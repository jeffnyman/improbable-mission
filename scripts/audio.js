export class GameAudio {
  constructor() {
    this.engine = null;
    this.context = null;
    this.sounds = {};

    // Holds requested sound effects in a given scan frame.
    // This should be emptied before every frame.
    this.queue = [];

    // Buffer source objects of actually played sounds.
    // This needs to be stopped.
    this.activeSounds = [];

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
    this.engine = engine;

    try {
      this.context = new AudioContext();
    } catch (error) {
      console.error("Web Audio API not supported:", error);
      return;
    }
  }

  request(audio) {
    if (!this.context) return;

    // Check if the sound is already in the queue.
    for (var i = 0; i < this.queue.length; i++) {
      if (this.queue[i].name == audio.name && !audio.offset) return;
    }

    this.queue.push(audio);

    return true;
  }

  playQueue() {
    if (this.engine.options.sound == "off" || !this.context) return false;

    for (var i = 0; i < this.queue.length; i++) {
      let req = this.queue[i];

      if (!req.name) continue;
      if (req.loop === undefined) req.loop = false;
      if (req.offset === undefined) req.offset = 0;

      this.activeSounds.push({
        name: req.name,
        bufferSource: this.play(req.name, req.loop, req.offset),
      });
    }
  }

  play(name, loop, offset) {
    if (this.engine.options.sound == "off" || !this.context) return false;

    let source = this.context.createBufferSource();

    source.buffer = this.sounds[name];
    source.loop = loop;
    source.connect(this.context.destination);

    if (!offset) {
      source.start(0);
    } else {
      setTimeout(function () {
        if (this.engine.options.sound == "off") return false;

        source.start(0);
      }, offset);
    }

    return source;
  }

  stopAllSound() {
    if (!this.context) return;

    for (var i = 0; i < this.activeSounds.length; i++) {
      this.activeSounds[i].bufferSource.stop(0);
    }

    this.queue = [];
    this.activeSounds = [];
  }
}
