import { graphics } from "../utils/graphics";
import { keyboard } from "../common/keyboardManager";

class Elevator {
  // Elevator vertical top position. This is the scroll position
  // of the world. The borders, walls, and corridors will all be
  // drawn with offsets calculated from this value.
  private y = 0;

  // Maximum scroll position of the world. This is the world-space
  // y-coordinate of the floor of the bottommost corridor. It will
  // eventually be derived from map data once corridors are defined.
  private readonly maxWorldY = 3000;

  // Direction elevator is moving. This can be "up" or "down".
  // An empty string means the elevator is not moving.
  private direction = "";

  scanRoutine() {
    const actionUp = keyboard.isKeyPressed(keyboard.keys.UP);
    const actionDown = keyboard.isKeyPressed(keyboard.keys.DOWN);

    // Determine which direction elevator should begin moving.
    if (actionDown && this.y < this.maxWorldY) {
      this.direction = "down";
    } else if (actionUp && this.y > 0) {
      this.direction = "up";
    }

    // Move elevator up or down.
    if (this.direction === "down") {
      this.y += 8;

      if (this.y > this.maxWorldY) {
        this.y = this.maxWorldY;
        this.direction = "";
      }
    } else if (this.direction === "up") {
      this.y -= 8;

      if (this.y < 0) {
        this.y = 0;
        this.direction = "";
      }
    }
  }

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

    // Draw the side walls.
    const wallOffset = this.y % 200;

    // Top left.
    graphics.draw(320, 0, 128, 200, 0, 0 - wallOffset);

    // Top right.
    graphics.draw(320, 0, 128, 200, 192, 0 - wallOffset);

    // Bottom left.
    graphics.draw(320, 0, 128, 200, 0, 200 - wallOffset);

    // Bottom right.
    graphics.draw(320, 0, 128, 200, 192, 200 - wallOffset);
  }
}

export const elevator: Elevator = new Elevator();
