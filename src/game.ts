import { audio } from "./components/audio";
import { Elevator } from "./components/elevator";

export class Game {
  private elevator: Elevator = new Elevator();

  private scene = "";
  private paused = false;

  init() {
    this.scene = "elevator";
  }

  currentScene(): string {
    return this.scene;
  }

  scanElevator() {
    this.elevator.scanRoutine();
  }

  animateElevator() {
    this.elevator.animationRoutine();
  }

  isPaused(): boolean {
    return this.paused;
  }

  pause() {
    this.togglePause(true);
  }

  unpause() {
    this.togglePause(false);
  }

  togglePause(status?: boolean) {
    if (status === undefined) {
      status = !this.paused;
    }

    this.paused = status;

    if (this.paused) {
      audio.stopAllSounds();
    }

    return status;
  }
}
