import { audio } from "./components/audio";
import { Agent } from "./components/agent";
import { Elevator } from "./components/elevator";
import { PocketComputer } from "./components/pocketComputer";

export class Game {
  private agent: Agent = new Agent();
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();

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
    this.pocketComputer.animationRoutine();
    this.agent.animationRoutine();
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
