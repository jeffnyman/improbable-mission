import { blackBallEnemies } from "./layout";

export class BlackBall {
  constructor(roomId) {
    this.roomId = roomId;

    // x is the horizontal position (in pixels).
    // y is the vertical position (in pixels).
    this.x = null;
    this.y = null;
  }

  init() {
    this.x = blackBallEnemies[this.roomId].x;
    this.y = blackBallEnemies[this.roomId].y;
  }
}
