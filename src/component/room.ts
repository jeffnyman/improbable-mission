import { game } from "../game";
import { log, logOnce } from "../utils/logger";
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
    logOnce("Animate the room ..."); // REMOVE
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
