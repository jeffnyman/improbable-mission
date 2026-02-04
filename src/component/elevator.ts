import { graphics } from "../utils/graphics";

class Elevator {
  private y = 0;

  animationRoutine() {
    // Draw the elevator shaft.
    graphics.rect(128, 0, 64, 200, 0);

    // Render the elevator sprite.
    graphics.draw(708, 16, 48, 96, 136, 0);

    // Draw the elevator borders.
    for (let i = 0; i < 10; i++) {
      const borderOffset = this.y % 24;

      // Left border.
      graphics.draw(756, 16, 8, 24, 128, i * 24 - 16 - borderOffset);

      // Right border.
      graphics.draw(756, 16, 8, 24, 184, i * 24 - 16 - borderOffset);
    }
  }
}

export const elevator: Elevator = new Elevator();
