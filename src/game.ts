import { audio } from "./components/audio";
import { sceneManager } from "./components/sceneManager";
import { Elevator } from "./components/elevator";
import { PocketComputer } from "./components/pocketComputer";

export class Game {
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();

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
    }
  }
}
