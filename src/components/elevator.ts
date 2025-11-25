import { graphics } from "../utils/graphics";

export class Elevator {
  animationRoutine() {
    // Draw the elevator shaft.
    graphics.rect(128, 0, 64, 200);

    // Draw the elevator.
    graphics.draw(708, 16, 48, 96, 136, 0);
  }
}
