import { graphics } from "../utils/graphics";

class PocketComputer {
  animationRoutine() {
    // Draw the full computer interface at the bottom of the screen.
    graphics.draw(0, 200, 320, 80, 0, 120);
  }
}

export const pocketComputer: PocketComputer = new PocketComputer();
