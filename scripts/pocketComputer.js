import { utils } from "./utils";

export class PocketComputer {
  constructor() {
    this.game = null;
    this.utils = utils;

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
    this.utils.draw(0, 200, 320, 80, 0, 120);

    if (this.state == "map") {
      // Map border
      this.utils.draw(0, 280, 164, 59, 58, 131);

      // Map view
      this.utils.rect(64, 136, 152, 48, 5);
    }
  }
}
