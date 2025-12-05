import { log } from "../utils/logger";
import { checkLayout } from "../ui/checkLayout";

export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private roomId: number;

  // The full map layout: each key is a column index (0-8)
  // and each value is an array of room IDs from top to bottom.
  private map: Record<number, number[]>;

  constructor(roomId: number, map: Record<number, number[]>) {
    this.roomId = roomId;
    this.map = map;
  }

  init() {
    this.setupRoomConnections();
  }

  private setupRoomConnections() {
    let elevatorLeft: number;
    let elevatorRight: number;
    let leftDoorPosition: string;
    let rightDoorPosition: string;

    for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
      const column = this.map[columnIndex];
      const floorIndex = column.indexOf(this.roomId);

      if (floorIndex !== -1) {
        log(
          `Room ${this.roomId} is at column ${columnIndex}, floor ${floorIndex}`,
        );

        const leftDoorType = checkLayout.hasLeftDoor(this.roomId);
        const rightDoorType = checkLayout.hasRightDoor(this.roomId);

        if (leftDoorType) {
          elevatorLeft = columnIndex;
          leftDoorPosition = leftDoorType === 1 ? "top" : "bottom";

          log(`Elevator left: ${elevatorLeft}`); // REMOVE
          log(`Left door position: ${leftDoorPosition}`); // REMOVE
        }

        if (rightDoorType) {
          elevatorRight = columnIndex + 1;
          rightDoorPosition = rightDoorType === 2 ? "top" : "bottom";

          log(`Elevator right: ${elevatorRight}`); // REMOVE
          log(`Right door position: ${rightDoorPosition}`); // REMOVE
        }

        break;
      }
    }
  }
}
