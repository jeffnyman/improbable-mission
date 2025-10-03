import { roomDoors } from "./layout";

class Utils {
  rnd(limit) {
    return Math.floor(Math.random() * limit) + 1;
  }

  hasLeftDoor(roomId) {
    console.log(`LDOOR 1: ${roomDoors[roomId].indexOf(1)}`); // REMOVE
    console.log(`LDOOR 4: ${roomDoors[roomId].indexOf(4)}`); // REMOVE

    if (roomDoors[roomId].indexOf(1) !== -1) return 1;
    else if (roomDoors[roomId].indexOf(4) !== -1) return 4;
    return false;
  }

  hasRightDoor(roomId) {
    console.log(`RDOOR 2: ${roomDoors[roomId].indexOf(2)}`); // REMOVE
    console.log(`RDOOR 3: ${roomDoors[roomId].indexOf(3)}`); // REMOVE

    if (roomDoors[roomId].indexOf(2) !== -1) return 2;
    else if (roomDoors[roomId].indexOf(3) !== -1) return 3;
    return false;
  }
}

export const utils = new Utils();
