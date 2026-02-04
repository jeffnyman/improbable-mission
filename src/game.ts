import { elevator } from "./component/elevator";
import { sceneManager } from "./common/sceneManager";
import { pocketComputer } from "./component/pocketComputer";

class Game {
  updateScan() {
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
