import { elevator } from "./component/elevator";
import { sceneManager } from "./common/sceneManager";

class Game {
  updateScan() {
    if (sceneManager.getScene() === "elevator") {
      elevator.scanRoutine();
    }
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      elevator.animationRoutine();
    }
  }
}

export const game: Game = new Game();
