import { roomDoors } from "../data/layout";

class CheckLayout {
  hasRightDoor(roomId: number) {
    if (roomDoors[roomId].indexOf(2) !== -1) return 2;
    else if (roomDoors[roomId].indexOf(3) !== -1) return 3;
    return false;
  }

  hasLeftDoor(roomId: number) {
    if (roomDoors[roomId].indexOf(1) !== -1) return 1;
    else if (roomDoors[roomId].indexOf(4) !== -1) return 4;
    return false;
  }
}

export const checkLayout: CheckLayout = new CheckLayout();
