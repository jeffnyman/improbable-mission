import { graphics } from "../utils/graphics";

class Elevator {
  animationRoutine() {
    // Draw the elevator shaft.
    graphics.rect(128, 0, 64, 200);

    // Render the elevator sprite.
    graphics.draw(708, 16, 48, 96, 136, 0);
  }
}

export const elevator: Elevator = new Elevator();
