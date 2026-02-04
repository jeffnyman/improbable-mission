import { elevator } from "./component/elevator";
import { sceneManager } from "./common/sceneManager";
import { logOnce } from "./utils/logger";

class Game {
  updateScan() {
    logOnce("Scanning ...");
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      elevator.animationRoutine();
    }
  }
}

export const game: Game = new Game();
