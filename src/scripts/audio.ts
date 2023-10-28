export class MissionAudio {
  context: AudioContext | null;

  constructor() {
    this.context = window.AudioContext ? new window.AudioContext() : null;
  }
}
