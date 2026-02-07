import { elevator } from "./elevator";
import { graphics } from "../utils/graphics";
import { gameTime } from "../common/gameTime";

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

      for (let elevator = 1; elevator <= 9; elevator++) {
        for (let level = 0; level < 6; level++) {
          // Only draw the elevator shaft line if this section has
          // been revealed.
          if (this.revealedMap[level][elevator - 1] === 1) {
            graphics.rect(83 + (elevator - 1) * 16, 136 + level * 8, 2, 8, 0);
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
