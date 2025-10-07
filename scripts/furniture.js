import { furnitureProperties } from "./layout";

export class Furniture {
  constructor(roomId, type, left, bottom) {
    this.roomId = roomId;
    this.type = type;

    // Left coordinate can be from 0 to 39.
    // Bottom coordinate can be from 0 to 24.
    this.left = left;
    this.bottom = bottom;

    // The searchTime is measured in pixels.
    this.searchTime = null;

    // This indicates what a given furniture item contains, which
    // can be found when searched. The options are nothing, snooze,
    // liftReset, and puzzle.
    this.contents = "nothing";

    // This holds what specific puzzle piece is contained within
    // the furniture item. This is only valid when the contents for
    // the item is "puzzle".
    this.puzzle = null;
  }

  init() {
    var fp = furnitureProperties[this.type];
    this.searchTime = fp.s;
  }
}
