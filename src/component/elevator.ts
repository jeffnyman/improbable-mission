import { graphics } from "../utils/graphics";

class Elevator {
  animationRoutine() {
    graphics.rect(128, 0, 64, 200);
  }
}

export const elevator: Elevator = new Elevator();
