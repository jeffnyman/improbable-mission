import { game } from "../game";
import { log } from "../utils/logger";
import { graphics } from "../utils/graphics";
import { roomColors } from "../data/layout";
import { layoutManager } from "../common/layoutManager";
import { calculateRoomConnections } from "../utils/roomConnections";

export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private id: number;

  // A room is revealed when the agent enters it.
  // This acts as a flag for the pocket computer map.
  private revealed = false;

  constructor(id: number) {
    this.id = id;
  }

  init() {
    this.setupRoomConnections();
  }

  setRevealed(value: boolean) {
    this.revealed = value;
  }

  isRevealed() {
    return this.revealed;
  }

  animationRoutine() {
    const bg = roomColors[this.id].bg;

    // Show the room background.
    graphics.rect(0, 0, 320, 200, bg);

    // Draw the room borders.
    for (let i = 0; i < 25; i++) {
      graphics.draw(344, 200, 8, 8, 0, 0 + i * 8);
      graphics.draw(352, 200, 8, 8, 312, 0 + i * 8);
    }

    // Cut out the doors from the borders.

    // Left top.
    if (layoutManager.hasLeftDoor(this.id) === 1) {
      graphics.rect(0, 8, 8, 40, bg);
    }

    // Left bottom.
    if (layoutManager.hasLeftDoor(this.id) === 4) {
      graphics.rect(0, 152, 8, 48, bg);
    }

    // Right top.
    if (layoutManager.hasRightDoor(this.id) === 2) {
      graphics.rect(312, 8, 8, 40, bg);
    }

    // Right bottom.
    if (layoutManager.hasRightDoor(this.id) === 3) {
      graphics.rect(312, 152, 8, 48, bg);
    }
  }

  private setupRoomConnections() {
    const rooms = game.getMap().rooms;
    const connection = calculateRoomConnections(this.id, rooms);

    if (!connection) {
      return;
    }

    log(
      `Room ${this.id} is at level ${connection.level}, elevator ${connection.elevator}`,
    );

    if (connection.leftDoor) {
      const elevatorLeft = connection.leftDoor.elevator;
      const leftDoorPosition = connection.leftDoor.position;

      log(
        `Left door connects to elevator shaft ${elevatorLeft} at ${leftDoorPosition}`,
      );
    }

    if (connection.rightDoor) {
      const elevatorRight = connection.rightDoor.elevator;
      const rightDoorPosition = connection.rightDoor.position;

      log(
        `Right door connects to elevator shaft ${elevatorRight} at ${rightDoorPosition}`,
      );
    }
  }
}
