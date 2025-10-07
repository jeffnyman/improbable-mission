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
  }

  init() {
    var fp = furnitureProperties[this.type];
    this.searchTime = fp.s;
  }
}
