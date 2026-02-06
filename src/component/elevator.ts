import { agent } from "./agent";
import { game } from "../game";
import { graphics } from "../utils/graphics";
import { keyboard } from "../common/keyboardManager";
import { layoutManager } from "../common/layoutManager";
import { audio } from "../common/audioManager";
import { roomColors } from "../data/layout";

class Elevator {
  // There are 8 elevators in the system. The player always
  // starts in the first one.
  private x = 1;

  // Elevator vertical top position. This is the scroll position
  // of the world. The borders, walls, and corridors will all be
  // drawn with offsets calculated from this value.
  private y = 0;

  // Maximum scroll position of the world. Derived from the corridor
  // layout: 216 (corridor spacing) * 11 (last corridor index, from
  // 6 floors * 2 corridors per floor).
  private readonly maxWorldY = 2376;

  // Scroll position at which the bottom shaft cap begins to appear.
  // At maxWorldY the cap's bottom edge lands at screen_y 120, which
  // is where the pocket computer will sit.
  private readonly shaftBottomY = 2354;

  // Direction elevator is moving. This can be "up" or "down".
  // An empty string means the elevator is not moving.
  private direction = "";

  // Set whether the elevator sound should play.
  private sound: boolean | undefined = false;

  getCurrentPosition(): {
    x: number;
    y: number;
    rooms: number[][];
  } {
    return { x: this.x, y: this.y, rooms: game.getMap().rooms };
  }

  scanRoutine() {
    // Assume the agent is not in the elevator unless their
    // coordinates line up. Without this in place, the agent
    // could move the elevator up or down without actually
    // being in it!
    let agentInElevator = false;

    if (agent.getX() >= 129 && agent.getX() <= 156) {
      agentInElevator = true;
    }

    const actionUp = keyboard.isKeyPressed(keyboard.keys.UP);
    const actionDown = keyboard.isKeyPressed(keyboard.keys.DOWN);

    // Determine which direction elevator should begin moving.
    if (agentInElevator && actionDown && this.y < this.maxWorldY) {
      this.direction = "down";
    } else if (agentInElevator && actionUp && this.y > 0) {
      this.direction = "up";
    }

    // Request the start sound whenever the elevator is moving and
    // it hasn't been successfully queued yet. Checked every frame
    // so that a request that failed while sound was off will be
    // retried once sound is turned on, even if the key has been
    // released.
    if (this.direction && !this.sound) {
      this.sound = audio.request({ name: "elevator.start" });
    }

    // Move elevator up or down.
    if (this.direction === "down") {
      this.y += 8;

      if (this.y > this.maxWorldY) {
        this.y = this.maxWorldY;
        this.direction = "";

        if (this.sound) {
          this.sound = false;
          // Stop the movement sound before playing the stop sound
          audio.stopAllSounds();
          audio.request({ name: "elevator.stop" });
        }
      }
    } else if (this.direction === "up") {
      this.y -= 8;

      if (this.y < 0) {
        this.y = 0;
        this.direction = "";

        if (this.sound) {
          this.sound = false;
          // Stop the movement sound before playing the stop sound
          audio.stopAllSounds();
          audio.request({ name: "elevator.stop" });
        }
      }
    }

    // Stop at corridor position.
    if (this.y % 216 === 0 && this.direction && !actionUp && !actionDown) {
      if (
        layoutManager.hasRightCorridor(this.x, this.y, game.getMap().rooms) ||
        layoutManager.hasLeftCorridor(this.x, this.y, game.getMap().rooms)
      ) {
        this.direction = "";

        if (this.sound) {
          this.sound = false;
          audio.stopAllSounds();
          audio.request({ name: "elevator.stop" });
        }
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

    // Top of elevator shaft, if elevator is at top.
    if (this.y < 10) graphics.draw(708, 0, 64, 8, 128, 0 - this.y);

    // Bottom of elevator shaft, if elevator is at bottom.
    if (this.y > this.shaftBottomY)
      graphics.draw(708, 8, 64, 8, 128, 134 - (this.y - this.shaftBottomY));

    // Draw corridors.

    const mapRooms = game.getMap().rooms;

    // Iterate through rooms.
    for (let j = 0; j < 6; j++) {
      const leftRoomId = mapRooms[j][this.x - 1];
      const rightRoomId = mapRooms[j][this.x];

      // Draw the left corridors.
      if (leftRoomId > 0) {
        // This requires checking the layout for RIGHT doors.

        let level: number | false = false;

        if (layoutManager.hasRightDoor(leftRoomId) === 2) level = j * 2;
        else if (layoutManager.hasRightDoor(leftRoomId) === 3)
          level = j * 2 + 1;

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
          const roomColor = this.getRoomColor(leftRoomId).bg;
          graphics.rect(0, 208 - offset, 136, 40, roomColor);

          // Draw the wall lines.
          for (let k = 0; k < 4; k++) {
            graphics.rect(k * 32 + 22, 208 - offset, 2, 40, 12);
          }
        }
      }

      // Draw the right corridors.
      if (rightRoomId > 0) {
        // This requires checking the layout for LEFT doors.

        let level: number | false = false;

        if (layoutManager.hasLeftDoor(rightRoomId) === 1) level = j * 2;
        else if (layoutManager.hasLeftDoor(rightRoomId) === 4)
          level = j * 2 + 1;

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
          const roomColor = this.getRoomColor(rightRoomId).bg;
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

export const elevator: Elevator = new Elevator();
