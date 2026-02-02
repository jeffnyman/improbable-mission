import { elevator } from "./component/elevator";
import { sceneManager } from "./common/sceneManager";

class Game {
  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      elevator.animationRoutine();
    }
  }
}

export const game: Game = new Game();
