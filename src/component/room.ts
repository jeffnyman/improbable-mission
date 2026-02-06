import { layoutManager } from "../common/layoutManager";
import { game } from "../game";
import { log } from "../utils/logger";

export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  init() {
    this.setupRoomConnections();
  }

  private setupRoomConnections() {
    let elevatorLeft: number;
    let elevatorRight: number;
    let leftDoorPosition: string;
    let rightDoorPosition: string;

    const rooms = game.getMap().rooms;

    // Iterate over levels (rows) in row-major format.
    for (let levelIndex = 0; levelIndex < rooms.length; levelIndex++) {
      const level = rooms[levelIndex];
      const elevatorIndex = level.indexOf(this.id);

      if (elevatorIndex !== -1) {
        log(
          `Room ${this.id} is at level ${levelIndex}, elevator ${elevatorIndex}`,
        );

        const leftDoorType = layoutManager.hasLeftDoor(this.id);
        const rightDoorType = layoutManager.hasRightDoor(this.id);

        if (leftDoorType) {
          elevatorLeft = elevatorIndex;
          leftDoorPosition = leftDoorType === 1 ? "top" : "bottom";

          log(`Elevator left: ${elevatorLeft}`); // REMOVE
          log(`Left door position: ${leftDoorPosition}`); // REMOVE
        }

        if (rightDoorType) {
          elevatorRight = elevatorIndex + 1;
          rightDoorPosition = rightDoorType === 2 ? "top" : "bottom";

          log(`Elevator right: ${elevatorRight}`); // REMOVE
          log(`Right door position: ${rightDoorPosition}`); // REMOVE
        }

        break;
      }
    }
  }
}
