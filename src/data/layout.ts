import type { RoomColor } from "../types/layout";

/**
 * A layout is a map made up of rooms. There are 54 possible
 * locations and 32 possible rooms within those locations. A
 * value of 0 indicates no room.
 *
 * Format: Row-major, where rooms[level][elevator]
 * - 6 levels (rows 0-5)
 * - 8 elevator positions (columns 0-7)
 */
// prettier-ignore
export const maps = [
  {
    rooms: [
      [27, 25, 20, 0, 3, 16, 8, 9, 0],  // Level 0
      [0, 18, 2, 0, 4, 19, 0, 0, 0],    // Level 1
      [28, 13, 0, 5, 26, 32, 1, 15, 0], // Level 2
      [10, 29, 0, 14, 21, 0, 23, 0, 0], // Level 3
      [0, 30, 0, 0, 12, 22, 0, 0, 0],   // Level 4
      [11, 0, 0, 0, 6, 7, 24, 17, 31],  // Level 5
    ],
  },
];

/**
 * Left doors: types 1 (top-left) or 4 (bottom-left)
 * Right doors: types 2 (top-right) or 3 (bottom-right)
 *
 * 1 = Top-left corner exit
 * 2 = Top-right corner exit
 * 3 = Bottom-right corner exit
 * 4 = Bottom-left corner exit
 */
export const roomDoors = [
  [0],
  [3],
  [2, 4],
  [1, 3],
  [1, 2],
  [2, 4],
  [1],
  [2, 4],
  [1, 2],
  [2, 4],
  [2],
  [3],
  [4],
  [1, 3],
  [3, 4],
  [1, 2],
  [3, 4],
  [1, 3],
  [2],
  [4],
  [1, 2],
  [1],
  [1, 3],
  [1],
  [3, 4],
  [4],
  [1],
  [3],
  [2],
  [3, 4],
  [2],
  [4],
  [3],
];

/**
 * bg: Background color of the room
 */
export const roomColors: Record<number, RoomColor> = {
  1: { bg: 5 },
  2: { bg: 7 },
  3: { bg: 5 },
  4: { bg: 7 },
  5: { bg: 3 },
  6: { bg: 7 },
  7: { bg: 5 },
  8: { bg: 7 },
  9: { bg: 5 },
  10: { bg: 5 },
  11: { bg: 7 },
  12: { bg: 3 },
  13: { bg: 3 },
  14: { bg: 5 },
  15: { bg: 3 },
  16: { bg: 7 },
  17: { bg: 3 },
  18: { bg: 3 },
  19: { bg: 3 },
  20: { bg: 3 },
  21: { bg: 5 },
  22: { bg: 3 },
  23: { bg: 5 },
  24: { bg: 7 },
  25: { bg: 3 },
  26: { bg: 3 },
  27: { bg: 3 },
  28: { bg: 5 },
  29: { bg: 7 },
  30: { bg: 5 },
  31: { bg: 3 },
  32: { bg: 7 },
};
