import { elevator } from "./component/elevator";
import { sceneManager } from "./common/sceneManager";
import { pocketComputer } from "./component/pocketComputer";
import { audio } from "./common/audioManager";

class Game {
  updateScan() {
    // Clear audio queue from previous frame before processing
    // new requests.
    audio.emptyRequestQueue();

    if (sceneManager.getScene() === "elevator") {
      elevator.scanRoutine();
    }
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      elevator.animationRoutine();
      pocketComputer.animationRoutine();
    }
  }
}

export const game: Game = new Game();
