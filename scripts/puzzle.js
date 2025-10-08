import { utils } from "./utils";

export class Puzzle {
  constructor(id) {
    // The puzzle ID will be a value between 0 and 35.
    this.id = id;

    // Values are: 5=green, 7=yellow, 3=cyan
    this.color = 5;

    // Determines if the vertical or horizontal orientation
    // are flipped for the puzzle piece.
    this.flipVertical = false;
    this.flipHorizontal = false;
  }

  setProperties(color) {
    if (!color) {
      this.color = [5, 7, 3][utils.rnd(3) - 1];
    } else {
      this.color = color;
    }

    this.flipVertical = utils.rnd(2) == 1 ? true : false;
    this.flipHorizontal = utils.rnd(2) == 1 ? true : false;
  }
}
