import { checkLayout } from "../utils/checkLayout";
import { roomColors } from "../data/layout";
import { graphics } from "../utils/graphics";
import { keyboard } from "./keyboard";
import { audio } from "./audio";

function getRoomColor(roomId: number) {
  return (roomColors as Record<number, { bg: number }>)[roomId];
}

export class Elevator {
  // There are 8 elevators in the system. The player always
  // starts in the first one.
  private x = 1;

  // Elevator vertical top position. This is the scroll position
  // of the world. The borders, walls, and corridors will all be
  // drawn with offsets calculated from this value.
  private y = 0;

  // Direction elevator is moving. This can be "up" or "down".
  // An empty string means the elevator is not moving.
  private d = "";

  // Set whether the elevator sound should play.
  private sound: boolean | undefined = false;

  // Map rooms data from the game.
  private mapRooms!: Record<string, number[]>;

  init(mapRooms: Record<string, number[]>) {
    this.mapRooms = mapRooms;
  }

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

    // Top of elevator shaft, if elevator is at top.
    if (this.y < 10) graphics.draw(708, 0, 64, 8, 128, 0 - this.y);

    // Bottom of elevator shaft, if elevator is at bottom.
    if (this.y > 2354) graphics.draw(708, 8, 64, 8, 128, 134 - (this.y - 2354));

    // Draw corridors.
    const leftRooms = this.mapRooms[this.x - 1];
    const rightRooms = this.mapRooms[this.x];

    // Iterate through rooms, column-major format.
    for (let j = 0; j < 6; j++) {
      // Draw the left corridors.
      if (leftRooms[j] > 0) {
        // NOTE: Requires checking layout for RIGHT doors.
        const roomId = leftRooms[j];
        let level: number | false = false;

        if (checkLayout.hasRightDoor(roomId) == 2) level = j * 2;
        else if (checkLayout.hasRightDoor(roomId) == 3) level = j * 2 + 1;

        // Handle if a corridor needs to be drawn.
        if (
          level !== false &&
          this.y > 216 * level - 168 &&
          this.y < 216 * level + 96
        ) {
          const offset = this.y - (216 * level - 168);

          // Draw ceiling border.
          graphics.draw(164, 280, 136, 8, 0, 200 - offset);

          // Draw the floor.
          graphics.draw(164, 312, 136, 8, 0, 248 - offset);

          // Draw floor border.
          graphics.draw(164, 288, 136, 8, 0, 256 - offset);

          // Draw background color. This is based on the color
          // of the room that the corridor leads to.
          const roomColor = getRoomColor(roomId).bg;
          graphics.rect(0, 208 - offset, 136, 40, roomColor);

          // Draw the wall lines.
          for (let k = 0; k < 4; k++) {
            graphics.rect(k * 32 + 22, 208 - offset, 2, 40, 12);
          }
        }
      }

      // Draw the right corridors.
      if (rightRooms[j] > 0) {
        // NOTE: Requires checking layout for LEFT doors.
        const roomId = rightRooms[j];
        let level: number | false = false;

        if (checkLayout.hasLeftDoor(roomId) == 1) level = j * 2;
        else if (checkLayout.hasLeftDoor(roomId) == 4) level = j * 2 + 1;

        // Handle if a corridor needs to be drawn.
        if (
          level !== false &&
          this.y > 216 * level - 168 &&
          this.y < 216 * level + 96
        ) {
          const offset = this.y - (216 * level - 168);

          // Draw ceiling border.
          graphics.draw(164, 296, 136, 8, 184, 200 - offset);

          // Draw the floor.
          graphics.draw(164, 320, 136, 8, 184, 248 - offset);

          // Draw floor border.
          graphics.draw(164, 304, 136, 8, 184, 256 - offset);

          // Draw background color. This is based on the color
          // of the room that the corridor leads to.
          const roomColor = getRoomColor(roomId).bg;
          graphics.rect(184, 208 - offset, 136, 40, roomColor);

          // Draw the wall lines.
          for (let m = 0; m < 4; m++) {
            graphics.rect(m * 32 + 200, 208 - offset, 2, 40, 12);
          }
        }
      }
    }
  }
}
