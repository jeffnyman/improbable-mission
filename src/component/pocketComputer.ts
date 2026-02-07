import { graphics } from "../utils/graphics";

class PocketComputer {
  animationRoutine() {
    // Draw the full computer interface at the bottom of the screen.
    graphics.draw(0, 200, 320, 80, 0, 120);

    // Draw the map border.
    graphics.draw(0, 280, 164, 59, 58, 131);

    // Establish the map view boundary.
    graphics.rect(64, 136, 152, 48, 5);
  }
}

export const pocketComputer: PocketComputer = new PocketComputer();
