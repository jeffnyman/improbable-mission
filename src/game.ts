import { sceneManager } from "./components/sceneManager";
import { Elevator } from "./components/elevator";

export class Game {
  private elevator: Elevator = new Elevator();

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      this.elevator.animationRoutine();
    }
  }
}
