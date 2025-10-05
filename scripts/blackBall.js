import { blackBallEnemies } from "./layout";

export class BlackBall {
  constructor(roomId) {
    this.roomId = roomId;
  }

  init() {
    this.x = blackBallEnemies[this.roomId].x;
    this.y = blackBallEnemies[this.roomId].y;
  }
}
