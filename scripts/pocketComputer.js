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
          }
        }
      }
    }
  }
}
