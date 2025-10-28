import { graphics } from "../utils/graphics";
import { keyboard } from "./keyboard";
import { audio } from "./audio";

export class Elevator {
  // Elevator vertical top position. This is the scroll position
  // of the world. The borders, walls, and corridors will all be
  // drawn with offsets calculated from this value.
  private y = 0;

  // Direction elevator is moving. This can be "up" or "down".
  // An empty string means the elevator is not moving.
  private d = "";

  // Set whether the elevator sound should play.
  private sound: boolean | undefined = false;

  scanRoutine() {
    const actionUp = keyboard.isKeyPressed(keyboard.keys.UP);
    const actionDown = keyboard.isKeyPressed(keyboard.keys.DOWN);

    // Determine which direction elevator should begin moving.
    if (actionDown && this.y < 2376) {
      this.d = "down";

      if (!this.sound) {
        this.sound = audio.request({ name: "elevatorStart" });
      }
    } else if (actionUp && this.y > 0) {
      this.d = "up";

      if (!this.sound) {
        this.sound = audio.request({ name: "elevatorStart" });
      }
    }

    // Move elevator up or down.
    if (this.d === "down") {
      this.y += 8;

      if (this.y > 2376) {
        this.y = 2376;
        this.d = "";

        if (this.sound) {
          audio.stopAllSounds();
          this.sound = false;
        }

        audio.request({ name: "elevatorStop" });
      }
    } else if (this.d === "up") {
      this.y -= 8;

      if (this.y < 0) {
        this.y = 0;
        this.d = "";

        if (this.sound) {
          audio.stopAllSounds();
          this.sound = false;
        }

        audio.request({ name: "elevatorStop" });
      }
    }
  }

  animationRoutine() {
    // Draw the elevator shaft.
    graphics.rect(128, 0, 64, 200, 0);

    // Draw the elevator.
    graphics.draw(708, 16, 48, 96, 136, 0);

    // Draw the borders.
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
