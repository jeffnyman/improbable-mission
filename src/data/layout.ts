/*
9 rows.
6 columns.
54 total items.
32 valid rooms.
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

/*
Left doors: types 1 (top-left) or 4 (bottom-left)
Right doors: types 2 (top-right) or 3 (bottom-right)

1 = Top-left corner exit
2 = Top-right corner exit
3 = Bottom-right corner exit
4 = Bottom-left corner exit
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

export const roomColors = {
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
