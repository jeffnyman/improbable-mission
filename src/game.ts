import { audio } from "./components/audio";
import { sceneManager } from "./components/sceneManager";
import { Agent } from "./components/agent";
import { Elevator } from "./components/elevator";
import { PocketComputer } from "./components/pocketComputer";

export class Game {
  private agent: Agent = new Agent();
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();
  private paused = false;

  updateScan() {
    // Empty the audio request queue.
    audio.emptyRequestQueue();

    if (sceneManager.getScene() === "elevator") {
      this.elevator.scanRoutine();
    }

    audio.playQueue();
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      this.elevator.animationRoutine();
      this.pocketComputer.animationRoutine();
      this.agent.animationRoutine();
    }
  }

  isPaused(): boolean {
    return this.paused;
  }

  togglePause(status?: boolean) {
    if (status === undefined) {
      status = !this.paused;
    }

    this.paused = status;
    const context = audio.getContext();

    if (!context) return status;

    if (this.paused) {
      context.suspend();
    } else {
      context.resume();
    }

    return status;
  }
}
