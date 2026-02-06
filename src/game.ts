import { agent } from "./component/agent";
import { elevator } from "./component/elevator";
import { sceneManager } from "./common/sceneManager";
import { pocketComputer } from "./component/pocketComputer";
import { audio } from "./common/audioManager";

class Game {
  private paused = false;

  updateScan() {
    // Clear audio queue from previous frame before processing
    // new requests.
    audio.emptyRequestQueue();

    if (sceneManager.getScene() === "elevator") {
      elevator.scanRoutine();
    }

    // Play all sounds requested during this frame.
    audio.playQueue();
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      elevator.animationRoutine();
      pocketComputer.animationRoutine();
      agent.animationRoutine();
    }
  }

  isPaused(): boolean {
    return this.paused;
  }

  togglePause(status?: boolean): boolean {
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

export const game: Game = new Game();
