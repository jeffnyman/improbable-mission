import { roomDoors } from "./layout";

class Utils {
  constructor() {
    this.engine = null;
  }

  setEngine(engine) {
    this.engine = engine;
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
