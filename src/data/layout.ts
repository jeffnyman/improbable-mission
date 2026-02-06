/**
 * A layout is a map made up of rooms. There are 54 possible
 * locations and 32 possible rooms within those locations. A
 * value of 0 indicates no room.
 */
export const maps = [
  {
    rooms: {
      0: [27, 0, 28, 10, 0, 11],
      1: [25, 18, 13, 29, 30, 0],
      2: [20, 2, 0, 0, 0, 0],
      3: [0, 0, 5, 14, 0, 0],
      4: [3, 4, 26, 21, 12, 6],
      5: [16, 19, 32, 0, 22, 7],
      6: [8, 0, 1, 23, 0, 24],
      7: [9, 0, 15, 0, 0, 17],
      8: [0, 0, 0, 0, 0, 31],
    },
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
