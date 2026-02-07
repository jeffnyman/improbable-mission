import { game } from "../game";
import { log } from "../utils/logger";
import { graphics } from "../utils/graphics";
import { roomColors } from "../data/layout";
import { calculateRoomConnections } from "../utils/roomConnections";

export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  init() {
    this.setupRoomConnections();
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
