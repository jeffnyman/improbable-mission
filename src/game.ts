import { sceneManager } from "./components/sceneManager";
import { Elevator } from "./components/elevator";
import { PocketComputer } from "./components/pocketComputer";
import { logOnce } from "./utils/logger";

export class Game {
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();

  updateScan() {
    logOnce("Scan routine on game...");

    if (sceneManager.getScene() === "elevator") {
      this.elevator.scanRoutine();
    }
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      this.elevator.animationRoutine();
      this.pocketComputer.animationRoutine();
    }
  }
}
