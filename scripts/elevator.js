import { utils } from "./utils";

export class Elevator {
  constructor() {
    this.utils = utils;
  }

  init() {
    // Elevator vertical top position.
    this.y = 0;
  }

  animationRoutine() {
    this.utils.rect(128, 0, 64, 200, 0);
    this.utils.draw(708, 16, 48, 96, 136, 0);

    // Borders
    for (var i = 0; i < 10; i++) {
      let borderOffset = this.y % 24;

      // Left border.
      this.utils.draw(756, 16, 8, 24, 128, i * 24 - 16 - borderOffset);

      // Right border.
      this.utils.draw(756, 16, 8, 24, 184, i * 24 - 16 - borderOffset);
    }
  }
}
