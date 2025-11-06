import { graphics } from "../utils/graphics";

export class PocketComputer {
  // The pocket computer has three states: map, puzzles, phone.
  private state = "map";

  animationRoutine() {
    // Draw the full interface.
    graphics.draw(0, 200, 320, 80, 0, 120);

    if (this.state === "map") {
      // Draw the map border.
      graphics.draw(0, 280, 164, 59, 58, 131);

      // Establish the map view boundary.
      graphics.rect(64, 136, 152, 48, 5);
    }
  }
}
