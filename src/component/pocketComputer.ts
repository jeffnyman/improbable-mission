import { game } from "../game";
import { elevator } from "./elevator";
import { graphics } from "../utils/graphics";
import { gameTime } from "../common/gameTime";
import { layoutManager } from "../common/layoutManager";

class PocketComputer {
  // Holds the revealed, and thus by definition, the unrevealed
  // areas of elevator system. The full map will always be
  // unrevealed at the start. The one exception to this is the
  // first elevator on the first level, which is always revealed
  // immediately.
  // Structure: revealedMap[level][elevator] to match row-major
  // format of layout
  private revealedMap: number[][] = [];

  private state = "map";

  constructor() {
    // Initialize 6 levels, each with 9 elevator positions (0-8).
    // Note that there are only 8 distinct elevators.
    for (let level = 0; level < 6; level++) {
      this.revealedMap[level] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    // Reveal first elevator (index 0) on first level (index 0)
    this.revealedMap[0][0] = 1;
  }

  getState() {
    return this.state;
  }

  revealMapSection(elevatorNum: number, level: number) {
    this.revealedMap[level][elevatorNum] = 1;
  }

  animationRoutine() {
    if (this.state === "map") {
      // Draw the full computer interface at the bottom of the screen.
      graphics.draw(0, 200, 320, 80, 0, 120);

      // Draw the map border.
      graphics.draw(0, 280, 164, 59, 58, 131);

      // Establish the map view boundary.
      graphics.rect(64, 136, 152, 48, 5);

      // Keeping in mind the room layout as it is in the
      // row-major format, this will iterate through the
      // nine elevator shafts and the six levels.
      const rooms = game.getMap().rooms;

      for (let elevator = 1; elevator <= 9; elevator++) {
        for (let level = 0; level < 6; level++) {
          // Only draw the elevator shaft line if this section has
          // been revealed.
          if (this.revealedMap[level][elevator - 1] === 1) {
            graphics.rect(83 + (elevator - 1) * 16, 136 + level * 8, 2, 8, 0);

            // Is there a left room? (room to the left of this elevator)
            const leftRoomId = elevator > 0 ? rooms[level][elevator - 1] : 0;

            if (leftRoomId) {
              if (layoutManager.hasRightDoor(leftRoomId) === 2) {
                // Draw the right top corridor.
                graphics.rect(
                  80 + (elevator - 1) * 16,
                  137 + level * 8,
                  3,
                  1,
                  0,
                );
              } else if (layoutManager.hasRightDoor(leftRoomId) === 3) {
                // Draw the right bottom corridor.
                graphics.rect(
                  80 + (elevator - 1) * 16,
                  141 + level * 8,
                  3,
                  1,
                  0,
                );
              }

              // Check if the room is revealed.
              // Draw room indicator to the LEFT of the elevator shaft.
              if (
                layoutManager.hasRightDoor(leftRoomId) &&
                game.getRoom(leftRoomId).isRevealed()
              ) {
                graphics.rect(
                  72 + (elevator - 1) * 16,
                  137 + level * 8,
                  8,
                  5,
                  0,
                );
              }
            }

            // Is there a right room? (room to the right of this elevator)
            const rightRoomId = elevator < 9 ? rooms[level][elevator] : 0;

            if (rightRoomId) {
              if (layoutManager.hasLeftDoor(rightRoomId) === 1) {
                // Draw the left top corridor.
                graphics.rect(
                  85 + (elevator - 1) * 16,
                  137 + level * 8,
                  3,
                  1,
                  0,
                );
              } else if (layoutManager.hasLeftDoor(rightRoomId) === 4) {
                // Draw the left bottom corridor.
                graphics.rect(
                  85 + (elevator - 1) * 16,
                  141 + level * 8,
                  3,
                  1,
                  0,
                );
              }

              // Check if the room is revealed.
              // Draw room indicator to the RIGHT of the elevator shaft.
              if (
                layoutManager.hasLeftDoor(rightRoomId) &&
                game.getRoom(rightRoomId).isRevealed()
              ) {
                graphics.rect(
                  88 + (elevator - 1) * 16,
                  137 + level * 8,
                  8,
                  5,
                  0,
                );
              }
            }
          }
        }
      }

      // Draw the elevator point.
      graphics.rect(
        83 + (elevator.getCurrentPosition().x - 1) * 16,
        136 + Math.floor(elevator.getCurrentPosition().y / 53),
        2,
        3,
        [0, 11, 12, 15, 1, 15, 12, 11][
          Math.floor((gameTime.getAFC() % 24) / 3)
        ],
      );
    }
  }
}

export const pocketComputer: PocketComputer = new PocketComputer();
