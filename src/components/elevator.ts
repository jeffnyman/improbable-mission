import { audio } from "./audio";
import { graphics } from "../utils/graphics";
import { keyboard } from "../utils/keyboard";
import { checkLayout } from "../ui/checkLayout";
import { roomColors } from "../data/layout";

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
  private direction = "";

  // Set whether the elevator sound should play.
  private sound: boolean | undefined = false;

  // Holds room data from the current layout map.
  private rooms: Record<number, number[]> = {};

  init(rooms: Record<number, number[]>) {
    this.rooms = rooms;
  }

  getCurrentPosition(): {
    x: number;
    y: number;
    rooms: Record<number, number[]>;
  } {
    return { x: this.x, y: this.y, rooms: this.rooms };
  }

  scanRoutine(
    agentX: number,
    agentAction: string,
    onEnterRoom: (direction: string) => void,
  ) {
    // Assume the agent is not in the elevator unless their
    // coordinates line up. Without this in place, the agent
    // could move the elevator up or down without actually
    // being in it!
    let agentInElevator = false;

    if (agentX >= 129 && agentX <= 156) {
      agentInElevator = true;
    }

    // Handle the agent entering a room.
    if (agentX <= -25 || agentX >= 315) {
      const direction = agentX <= -25 ? "left" : "right";
      onEnterRoom(direction);
    }

    const actionUp = keyboard.isKeyPressed(keyboard.keys.UP);
    const actionDown = keyboard.isKeyPressed(keyboard.keys.DOWN);

    // Determine which direction elevator should begin moving.
    if (
      agentInElevator &&
      agentAction === "stand" &&
      actionDown &&
      this.y < 2376
    ) {
      this.direction = "down";

      if (!this.sound) {
        this.sound = audio.request({ name: "elevatorStart" });
      }
    } else if (
      agentInElevator &&
      agentAction === "stand" &&
      actionUp &&
      this.y > 0
    ) {
      this.direction = "up";

      if (!this.sound) {
        this.sound = audio.request({ name: "elevatorStart" });
      }
    }

    // Move elevator up or down.
    if (this.direction === "down") {
      this.y += 8;

      if (this.y > 2376) {
        this.y = 2376;
        this.direction = "";

        if (this.sound) {
          this.sound = false;
          audio.stopAllSounds();
          audio.request({ name: "elevatorStop" });
        }
      }
    } else if (this.direction === "up") {
      this.y -= 8;

      if (this.y < 0) {
        this.y = 0;
        this.direction = "";

        if (this.sound) {
          this.sound = false;
          audio.stopAllSounds();
          audio.request({ name: "elevatorStop" });
        }
      }
    }

    // Stop at a corridor position.
    if (this.y % 216 === 0 && this.direction && !actionUp && !actionDown) {
      if (
        checkLayout.hasRightCorridor(this.x, this.y, this.rooms) ||
        checkLayout.hasLeftCorridor(this.x, this.y, this.rooms)
      ) {
        this.direction = "";

        if (this.sound) {
          this.sound = false;
          audio.stopAllSounds();
          audio.request({ name: "elevatorStop" });
        }
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
    const leftRooms = this.rooms[this.x - 1];
    const rightRooms = this.rooms[this.x];

    // Iterate through rooms, column-major format.
    for (let j = 0; j < 6; j++) {
      // Draw the left corridors.
      if (leftRooms[j] > 0) {
        // This requires checking layout for RIGHT doors.
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
          const roomColor = this.getRoomColor(roomId).bg;
          graphics.rect(0, 208 - offset, 136, 40, roomColor);

          // Draw the wall lines.
          for (let k = 0; k < 4; k++) {
            graphics.rect(k * 32 + 22, 208 - offset, 2, 40, 12);
          }
        }
      }

      // Draw the right corridors.
      if (rightRooms[j] > 0) {
        // This requires checking layout for LEFT doors.
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
          const roomColor = this.getRoomColor(roomId).bg;
          graphics.rect(184, 208 - offset, 136, 40, roomColor);

          // Draw the wall lines.
          for (let m = 0; m < 4; m++) {
            graphics.rect(m * 32 + 200, 208 - offset, 2, 40, 12);
          }
        }
      }
    }
  }

  private getRoomColor(roomId: number) {
    return (roomColors as Record<number, { bg: number }>)[roomId];
  }
}
