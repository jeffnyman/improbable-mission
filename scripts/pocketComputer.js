import { utils } from "./utils";

export class PocketComputer {
  constructor() {
    this.game = null;
    this.utils = utils;

    // This is done because the pocket computer should not be shown
    // during the "Another visitor" dialogue.
    this.visible = false;

    // Holds the revealed, and thus by definition, the unrevealed
    // areas of elevator system. The full map will always be
    // unrevealed at the start. The one exception to this is the
    // first elevator on the first level, which is always revealed
    // immediately.
    this.revealedMap = {};

    this.state = "map";
  }

  init(game) {
    this.game = game;

    for (var i = 1; i <= 8; i++) {
      this.revealedMap[i] = [0, 0, 0, 0, 0, 0];
      this.revealedMap[1][0] = 1;
    }
  }

  animationRoutine() {
    if (!this.visible) return;

    this.utils.draw(0, 200, 320, 80, 0, 120);

    if (this.state == "map") {
      // Map border
      this.utils.draw(0, 280, 164, 59, 58, 131);

      // Map view
      this.utils.rect(64, 136, 152, 48, 5);

      for (var i = 1; i <= 8; i++) {
        for (var j = 0; j < 6; j++) {
          if (this.revealedMap[i][j]) {
            this.utils.rect(83 + (i - 1) * 16, 136 + j * 8, 2, 8, 0);

            // Is there a left room?
            let leftRoomId = this.game.map.rooms[i - 1][j];

            if (leftRoomId) {
              if (this.utils.hasRightDoor(leftRoomId) == 2) {
                // Draw the right top corridor.
                this.utils.rect(80 + (i - 1) * 16, 137 + j * 8, 3, 1, 0);
              } else if (this.utils.hasRightDoor(leftRoomId) == 3) {
                // Draw the right bottom corridor.
                this.utils.rect(80 + (i - 1) * 16, 141 + j * 8, 3, 1, 0);
              }

              // Check if room is revealed.
              if (
                this.utils.hasRightDoor(leftRoomId) &&
                this.game.rooms[leftRoomId].revealed
              ) {
                this.utils.rect(72 + (i - 1) * 16, 137 + j * 8, 8, 5, 0);
              }
            }

            // Is there a right room?
            let rightRoomId = this.game.map.rooms[i - 1][j];

            if (rightRoomId) {
              if (this.utils.hasLeftDoor(rightRoomId) == 1) {
                // Draw the left top corridor.
                this.utils.rect(85 + (i - 1) * 16, 137 + j * 8, 3, 1, 0);
              } else if (this.utils.hasLeftDoor(rightRoomId) == 4) {
                // Draw the left bottom corridor.
                this.utils.rect(85 + (i - 1) * 16, 141 + j * 8, 3, 1, 0);
              }

              // Check if room is revealed.
              if (
                this.utils.hasLeftDoor(rightRoomId) &&
                this.game.rooms[rightRoomId].revealed
              ) {
                this.utils.rect(88 + (i - 1) * 16, 137 + j * 8, 8, 5, 0);
              }
            }
          }
        }
      }

      // Draw the elevator point.
      this.utils.rect(
        83 + (this.game.elevator.x - 1) * 16,
        136 + Math.floor(this.game.elevator.y / 53),
        2,
        3,
        [0, 11, 12, 15, 1, 15, 12, 11][
          Math.floor((this.utils.getAFC() % 24) / 3)
        ],
      );
    }
  }
}
