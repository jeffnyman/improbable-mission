import { orbEnemies } from "./layout";

export class Orb {
  constructor(roomId) {
    this.roomId = roomId;

    // x is the horizontal position (in pixels).
    // y is the vertical position (in pixels).
    this.x = null;
    this.y = null;
  }

  init() {
    this.x = orbEnemies[this.roomId].x;
    this.y = orbEnemies[this.roomId].y;
  }
}
