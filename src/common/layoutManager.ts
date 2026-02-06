import { roomDoors } from "../data/layout";

class LayoutManager {
  /**
   * Check if a room has a right-side door and return its position.
   * @param roomId - The room ID to check
   * @returns 2 if top-right door exists, 3 if bottom-right door exists, false otherwise
   */
  hasRightDoor(roomId: number) {
    if (roomDoors[roomId].indexOf(2) !== -1) return 2;
    else if (roomDoors[roomId].indexOf(3) !== -1) return 3;
    return false;
  }

  /**
   * Check if a room has a left-side door and return its position.
   * @param roomId - The room ID to check
   * @returns 1 if top-left door exists, 4 if bottom-left door exists, false otherwise
   */
  hasLeftDoor(roomId: number) {
    if (roomDoors[roomId].indexOf(1) !== -1) return 1;
    else if (roomDoors[roomId].indexOf(4) !== -1) return 4;
    return false;
  }
}

export const layoutManager: LayoutManager = new LayoutManager();
