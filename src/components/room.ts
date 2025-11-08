import { checkLayout } from "../utils/checkLayout";
import { roomColors } from "../data/layout";
import { graphics } from "../utils/graphics";

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

  animationRoutine() {
    const bg = roomColors[this.roomId].bg;

    // Show the room background.
    graphics.rect(0, 0, 320, 200, bg);

    // Draw the room borders.
    for (let i = 0; i < 25; i++) {
      graphics.draw(344, 200, 8, 8, 0, 0 + i * 8);
      graphics.draw(352, 200, 8, 8, 312, 0 + i * 8);
    }

    // Cut out the doors from the borders.
    if (checkLayout.hasLeftDoor(this.roomId) === 1) {
      graphics.rect(0, 8, 8, 40, bg);
    }

    if (checkLayout.hasLeftDoor(this.roomId) === 4) {
      graphics.rect(0, 152, 8, 48, bg);
    }

    if (checkLayout.hasRightDoor(this.roomId) === 2) {
      graphics.rect(312, 8, 8, 40, bg);
    }

    if (checkLayout.hasRightDoor(this.roomId) === 3) {
      graphics.rect(312, 152, 8, 48, bg);
    }
  }

  setRevealed(value: boolean) {
    this.revealed = value;
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
