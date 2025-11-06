import { checkLayout } from "../utils/checkLayout";

export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private roomId: number;

  // This is the elevator level, which can run from 1 to 6.
  // A value of -1 means no elevator level.
  private floorLevel = -1;

  // These refer to the left and right side elevator numbers.
  // The values can run from 1 to 8. A value of 0 indicates
  // that there is no elevator to the left or right.
  // @ts-expect-error - currently used for debugging
  private elevatorLeft = 0;
  // @ts-expect-error - currently used for debugging
  private elevatorRight = 0;

  // These refer to the location of the door out of the room,
  // in terms of whether it is at the top or bottom of the
  // room.
  // @ts-expect-error - currently used for debugging
  private leftDoorPosition = "";
  // @ts-expect-error - currently used for debugging
  private rightDoorPosition = "";

  // A room is revealed when the agent enters it.
  // This acts as a flag for the pocket computer map.
  private revealed = false;

  constructor(roomId: number) {
    this.roomId = roomId;
  }

  init(mapRooms: Record<string, number[]>) {
    this.setupRoomConnections(mapRooms);
  }

  setupRoomConnections(mapRooms: Record<string, number[]>) {
    for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
      const column = mapRooms[columnIndex];
      const floorIndex = column.indexOf(this.roomId);

      if (floorIndex !== -1) {
        console.log(
          `Room ${this.roomId} is at column ${columnIndex}, floor ${floorIndex}`,
        ); // REMOVE

        this.floorLevel = floorIndex;

        const leftDoorType = checkLayout.hasLeftDoor(this.roomId);
        const rightDoorType = checkLayout.hasRightDoor(this.roomId);

        if (leftDoorType) {
          this.elevatorLeft = columnIndex;
          this.leftDoorPosition = leftDoorType === 1 ? "top" : "bottom";
        }

        if (rightDoorType) {
          this.elevatorRight = columnIndex + 1;
          this.rightDoorPosition = rightDoorType === 2 ? "top" : "bottom";
        }

        break;
      }
    }
  }

  getFloorLevel() {
    return this.floorLevel;
  }

  isRevealed() {
    return this.revealed;
  }
}
