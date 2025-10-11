import { utils } from "./utils";
import { roomColors } from "./layout";
import { keyboard } from "./keyboard";

export class Elevator {
  constructor() {
    this.utils = utils;
    this.game = null;
    this.direction = false;

    // This determines if the sound should play.
    this.sound = false;
  }

  init(game) {
    this.game = game;

    // There are 8 elevators in the system. The player always starts
    // in the first one.
    this.x = 1;

    // Elevator vertical top position.
    this.y = 0;
  }

  scanRoutine() {
    if (this.game.pocketComputer.state != "map") return;

    let agentInElevator = false;

    if (this.game.agent.x >= 129 && this.game.agent.x <= 156) {
      agentInElevator = true;
    }

    let buttonUp = keyboard.isKeyPressed(keyboard.keys.UP);
    let buttonDown = keyboard.isKeyPressed(keyboard.keys.DOWN);

    // Start moving the elevator down or up.
    if (
      agentInElevator &&
      this.game.agent.action == "stand" &&
      buttonDown &&
      this.y < 2376
    ) {
      this.direction = "down";

      if (!this.sound) {
        this.sound = this.game.engine.audio.request({ name: "elevatorStart" });
      }
    } else if (
      agentInElevator &&
      this.game.agent.action == "stand" &&
      buttonUp &&
      this.y > 0
    ) {
      this.direction = "up";

      if (!this.sound) {
        this.sound = this.game.engine.audio.request({ name: "elevatorStart" });
      }
    }

    // Move elevator down, stop at the bottom.
    // Move elevator up, stop at the top.
    if (this.direction == "down") {
      this.y += 8;

      if (this.y > 2376) {
        this.y = 2376;
        this.direction = false;

        if (this.sound) {
          this.game.engine.audio.stopAllSound();
        }

        this.sound = false;
        this.game.engine.audio.request({ name: "elevatorStop" });
      }
    } else if (this.direction == "up") {
      this.y -= 8;

      if (this.y < 0) {
        this.y = 0;
        this.direction = false;

        if (this.sound) {
          this.game.engine.audio.stopAllSound();
        }

        this.sound = false;
        this.game.engine.audio.request({ name: "elevatorStop" });
      }
    }

    // Stop at a corridor position.
    if (this.y % 216 === 0 && this.direction && !buttonUp && !buttonDown) {
      if (
        this.utils.hasLeftCorridor(this.x, this.y) ||
        this.utils.hasRightCorridor(this.x, this.y)
      ) {
        this.direction = false;

        if (this.sound) {
          this.game.engine.audio.stopAllSound();
        }

        this.sound = false;
        this.game.engine.audio.request({ name: "elevatorStop" });
      }
    }
  }

  animationRoutine() {
    this.utils.rect(128, 0, 64, 200, 0);
    this.utils.draw(708, 16, 48, 96, 136, 0);

    // Borders
    for (var i = 0; i < 10; i++) {
      let borderOffset = this.y % 24;

      // Left border.
      this.utils.draw(756, 16, 8, 24, 128, i * 24 - 16 - borderOffset);

      // Right border.
      this.utils.draw(756, 16, 8, 24, 184, i * 24 - 16 - borderOffset);
    }

    // Walls
    let wallOffset = this.y % 200;

    this.utils.draw(320, 0, 128, 200, 0, 0 - wallOffset);
    this.utils.draw(320, 0, 128, 200, 192, 0 - wallOffset);
    this.utils.draw(320, 0, 128, 200, 0, 200 - wallOffset);
    this.utils.draw(320, 0, 128, 200, 192, 200 - wallOffset);

    // Top element (if needed).
    if (this.y < 10) this.utils.draw(708, 0, 64, 8, 128, 0 - this.y);

    // Bottom element (if needed).
    if (this.y > 2354)
      this.utils.draw(708, 8, 64, 8, 128, 134 - (this.y - 2354));

    // Corridors.
    const leftRooms = this.game.map.rooms[this.x - 1];
    const rightRooms = this.game.map.rooms[this.x];

    for (var j = 0; j < 6; j++) {
      if (leftRooms[j] > 0) {
        let roomId = leftRooms[j];
        let level = false;

        if (this.utils.hasRightDoor(roomId) == 2) level = j * 2;
        else if (this.utils.hasRightDoor(roomId) == 3) level = j * 2 + 1;

        // Does a corridor need to be drawn?
        if (
          level !== false &&
          this.y > 216 * level - 168 &&
          this.y < 216 * level + 96
        ) {
          let offset = this.y - (216 * level - 168);

          // ceiling
          this.utils.draw(164, 280, 136, 8, 0, 200 - offset);

          // floor
          this.utils.draw(164, 312, 136, 8, 0, 248 - offset);

          // bottom
          this.utils.draw(164, 288, 136, 8, 0, 256 - offset);

          // background color based on room color
          let roomColor = roomColors[roomId].bg;
          this.utils.rect(0, 208 - offset, 136, 40, roomColor);

          // lines
          for (var k = 0; k < 4; k++) {
            this.utils.rect(k * 32 + 22, 208 - offset, 2, 40, 12);
          }
        }
      }

      if (rightRooms[j] > 0) {
        let roomId = rightRooms[j];
        let level = false;

        if (this.utils.hasLeftDoor(roomId) == 1) level = j * 2;
        else if (this.utils.hasLeftDoor(roomId) == 4) level = j * 2 + 1;

        if (level === false) continue;

        // Does a corridor need to be drawn?
        if (this.y > 216 * level - 168 && this.y < 216 * level + 96) {
          let offset = this.y - (216 * level - 168);

          // ceiling
          this.utils.draw(164, 296, 136, 8, 184, 200 - offset);

          // floor
          this.utils.draw(164, 320, 136, 8, 184, 248 - offset);

          // bottom
          this.utils.draw(164, 304, 136, 8, 184, 256 - offset);

          // background color based on room color
          let roomColor = roomColors[roomId].bg;
          this.utils.rect(184, 208 - offset, 136, 40, roomColor);

          // lines
          for (var m = 0; m < 4; m++) {
            this.utils.rect(j * 32 + 200, 208 - offset, 2, 40, 12);
          }
        }
      }
    }
  }
}
