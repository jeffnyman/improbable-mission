import { roomDoors } from "../data/layout";

/**
 * Utility for checking room layout properties and corridor
 * connections. Handles the game's door numbering system
 * where:
 * - Left doors: 1 (top) and 4 (bottom)
 * - Right doors: 2 (top) and 3 (bottom)
 *
 * This allows checking if rooms can be connected via corridors
 * based on their door positions and the elevator's vertical
 * position.
 */
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

  /**
   * Check if a corridor can connect to the right from the
   * elevator's current position. Only checks at valid door
   * heights (position divisible by 216). Verifies that the
   * room to the right has a matching left door at the
   * correct height.
   * @param elevator - The elevator column index
   * @param position - The elevator's vertical position
   * @param rooms - The 2D room layout array
   * @returns true if a right corridor connection is possible, false otherwise
   */
  hasRightCorridor(elevator: number, position: number, rooms: number[][]) {
    if (position % 216 !== 0) return false;

    const level = Math.floor(position / 216 / 2);
    const doorLevel = (position / 216) % 2 ? "bottom" : "top";
    const rightRoomId = rooms[level][elevator];
    let connects = false;

    if (
      rightRoomId > 0 &&
      doorLevel === "top" &&
      this.hasLeftDoor(rightRoomId) === 1
    ) {
      connects = true;
    }

    if (
      rightRoomId > 0 &&
      doorLevel === "bottom" &&
      this.hasLeftDoor(rightRoomId) === 4
    ) {
      connects = true;
    }

    return connects;
  }

  /**
   * Check if a corridor can connect to the left from the
   * elevator's current position. Only checks at valid door
   * heights (position divisible by 216). Verifies that the
   * room to the left has a matching right door at the
   * correct height.
   * @param elevator - The elevator column index
   * @param position - The elevator's vertical position
   * @param rooms - The 2D room layout array
   * @returns true if a left corridor connection is possible, false otherwise
   */
  hasLeftCorridor(elevator: number, position: number, rooms: number[][]) {
    if (position % 216 !== 0) return false;

    const level = Math.floor(position / 216 / 2);
    const doorLevel = (position / 216) % 2 ? "bottom" : "top";
    const leftRoomId = rooms[level][elevator - 1];
    let connects = false;

    if (
      leftRoomId > 0 &&
      doorLevel === "top" &&
      this.hasRightDoor(leftRoomId) === 2
    ) {
      connects = true;
    }

    if (
      leftRoomId > 0 &&
      doorLevel === "bottom" &&
      this.hasRightDoor(leftRoomId) === 3
    ) {
      connects = true;
    }

    return connects;
  }
}

export const layoutManager: LayoutManager = new LayoutManager();
