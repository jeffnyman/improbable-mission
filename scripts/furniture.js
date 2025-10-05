import { furnitureProperties } from "./layout";

export class Furniture {
  constructor(roomId, type, left, bottom) {
    this.roomId = roomId;
    this.type = type;
    this.left = left;
    this.bottom = bottom;
    this.searchTime = null;
  }

  init() {
    var fp = furnitureProperties[this.type];
    this.searchTime = fp.s;
  }
}
