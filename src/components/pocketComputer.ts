import { graphics } from "../utils/graphics";

export class PocketComputer {
  animationRoutine() {
    // Draw the full interface.
    graphics.draw(0, 200, 320, 80, 0, 120);
  }
}
