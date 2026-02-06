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
