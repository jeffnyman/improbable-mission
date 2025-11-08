import { checkLayout } from "../utils/checkLayout";
import { graphics } from "../utils/graphics";
import { utils } from "../utils/common";
import { Room } from "./room";

export class PocketComputer {
  // This is done because the pocket computer should not be shown
  // during the "Another visitor" dialogue.
  private visible = false;

  // The pocket computer has three states: map, puzzles, phone.
  private state = "map";

  // Holds the revealed, and thus by definition, the unrevealed
  // areas of elevator system. The full map will always be
  // unrevealed at the start. The one exception to this is the
  // first elevator on the first level, which is always revealed
  // immediately.
  private revealedMap: Record<number, number[]> = {};

  // Map rooms data from the game.
  private mapRooms!: Record<string, number[]>;

  // Room instances from the game.
  private rooms!: Record<number, Room>;

  constructor() {
    for (let i = 1; i <= 8; i++) {
      this.revealedMap[i] = [0, 0, 0, 0, 0, 0];
      this.revealedMap[1][0] = 1;
    }
  }

  init(mapRooms: Record<string, number[]>, rooms: Record<number, Room>) {
    this.mapRooms = mapRooms;
    this.rooms = rooms;
  }

  getState() {
    return this.state;
  }

  setVisibleState(value: boolean) {
    this.visible = value;
  }

  revealMapSection(elevatorNum: number, level: number) {
    this.revealedMap[elevatorNum][level] = 1;
  }

  animationRoutine(elevatorPosition?: { x: number; y: number }) {
    if (!this.visible) return;

    // Draw the full interface.
    graphics.draw(0, 200, 320, 80, 0, 120);

    if (this.state === "map") {
      // Draw the map border.
      graphics.draw(0, 280, 164, 59, 58, 131);

      // Establish the map view boundary.
      graphics.rect(64, 136, 152, 48, 5);

      // Keeping in mind the room layout as it is in the
      // column-major format, this will iterate through
      // the nine floors and the six rooms.
      for (let i = 1; i <= 8; i++) {
        for (let j = 0; j < 6; j++) {
          if (this.revealedMap[i][j]) {
            graphics.rect(83 + (i - 1) * 16, 136 + j * 8, 2, 8, 0);

            // Is there a left room?
            const leftRoomId = this.mapRooms[i - 1][j];

            if (leftRoomId) {
              if (checkLayout.hasRightDoor(leftRoomId) === 2) {
                // Draw the right top corridor.
                graphics.rect(80 + (i - 1) * 16, 137 + j * 8, 3, 1, 0);
              } else if (checkLayout.hasRightDoor(leftRoomId) === 3) {
                // Draw the right bottom corridor.
                graphics.rect(80 + (i - 1) * 16, 141 + j * 8, 3, 1, 0);
              }

              // Check if the room is revealed.
              if (
                checkLayout.hasRightDoor(leftRoomId) &&
                this.rooms[leftRoomId].isRevealed()
              ) {
                graphics.rect(72 + (i - 1) * 16, 137 + j * 8, 8, 5, 0);
              }
            }

            // Is there a right room?
            const rightRoomId = this.mapRooms[i][j];

            if (rightRoomId) {
              if (checkLayout.hasLeftDoor(rightRoomId) === 1) {
                // Draw the left top corridor.
                graphics.rect(85 + (i - 1) * 16, 137 + j * 8, 3, 1, 0);
              } else if (checkLayout.hasLeftDoor(rightRoomId) === 4) {
                // Draw the left bottom corridor.
                graphics.rect(85 + (i - 1) * 16, 141 + j * 8, 3, 1, 0);
              }

              // Check if the room is revealed.
              if (
                checkLayout.hasLeftDoor(rightRoomId) &&
                this.rooms[rightRoomId].isRevealed()
              ) {
                graphics.rect(88 + (i - 1) * 16, 137 + j * 8, 8, 5, 0);
              }
            }
          }
        }
      }

      // Draw the elevator point.
      if (elevatorPosition) {
        graphics.rect(
          83 + (elevatorPosition.x - 1) * 16,
          136 + Math.floor(elevatorPosition.y / 53),
          2,
          3,
          [0, 11, 12, 15, 1, 15, 12, 11][Math.floor((utils.getAFC() % 24) / 3)],
        );
      }
    }
  }
}
