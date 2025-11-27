import { sceneManager } from "./components/sceneManager";
import { Elevator } from "./components/elevator";
import { logOnce } from "./utils/logger";

export class Game {
  private elevator: Elevator = new Elevator();

  updateScan() {
    logOnce("Scan routine on game...");
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      this.elevator.animationRoutine();
    }
  }
}
