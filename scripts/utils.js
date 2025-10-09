import { roomDoors } from "./layout";

class Utils {
  constructor() {
    this.engine = null;
  }

  setEngine(engine) {
    this.engine = engine;
  }

  fillStyle(colorIndex) {
    this.engine.ctx.fillStyle = "#" + this.engine.gameColors[colorIndex];
  }

  rect(x, y, w, h, colorIndex) {
    this.fillStyle(colorIndex);
    this.engine.ctx.fillRect(x * 3, y * 3, w * 3, h * 3);
  }

  draw(sx, sy, sw, sh, dx, dy) {
    this.engine.ctx.drawImage(
      this.engine.sprites[this.engine.options.palette],
      sx,
      sy,
      sw,
      sh,
      dx * 3,
      dy * 3,
      sw * 3,
      sh * 3,
    );
  }

  rnd(limit) {
    return Math.floor(Math.random() * limit) + 1;
  }

  hasLeftDoor(roomId) {
    if (roomDoors[roomId].indexOf(1) !== -1) return 1;
    else if (roomDoors[roomId].indexOf(4) !== -1) return 4;
    return false;
  }

  hasRightDoor(roomId) {
    if (roomDoors[roomId].indexOf(2) !== -1) return 2;
    else if (roomDoors[roomId].indexOf(3) !== -1) return 3;
    return false;
  }
}

export const utils = new Utils();
