export class Robot {
  constructor(roomId, left, bottom) {
    this.roomId = roomId;

    // Left is the left coordinate from 0 to 39.
    // Bottom is the bottom coordinate from 0 to 24.
    this.left = left;
    this.bottom = bottom;
  }

  init() {}
}
