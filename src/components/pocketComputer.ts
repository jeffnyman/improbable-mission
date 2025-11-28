import { graphics } from "../utils/graphics";

export class PocketComputer {
  animationRoutine() {
    // Draw the full computer interface at the bottom of the screen.
    graphics.draw(0, 200, 320, 80, 0, 120);
  }
}
