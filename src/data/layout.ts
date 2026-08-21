import type { RoomColor, ElevatorColor, MapLayout } from "../types/layout";

/**
 * A layout is a map made up of rooms. There are 54 possible
 * locations and 32 possible rooms within those locations. A
 * value of 0 indicates no room.
 *
 * Format: Row-major, where rooms[level][column]
 * - 6 levels (rows 0-5)
 * - 9 room columns (0-8), with the 8 elevator shafts between them
 *
 * Each map also carries the traversable extent of its 8 elevator
 * shafts (keyed 1-8): the top and bottom levels the elevator can
 * reach in that layout.
 *
 * Ported mechanically from the original constants.js. The original
 * stores its rooms column-major, so these tables are its transpose,
 * and tests/originalParity.spec.ts compares the two index by index —
 * which is what keeps the transposition honest.
 */
// prettier-ignore
export const maps: MapLayout[] = [
  // Map 0
  {
    rooms: [
      [27, 25, 20, 0, 3, 16, 8, 9, 0], // Level 0
      [0, 18, 2, 0, 4, 19, 0, 0, 0], // Level 1
      [28, 13, 0, 5, 26, 32, 1, 15, 0], // Level 2
      [10, 29, 0, 14, 21, 0, 23, 0, 0], // Level 3
      [0, 30, 0, 0, 12, 22, 0, 0, 0], // Level 4
      [11, 0, 0, 0, 6, 7, 24, 17, 31], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 6 }, 2: { top: 0, bottom: 5 }, 3: { top: 0, bottom: 4 }, 4: { top: 0, bottom: 6 },
      5: { top: 0, bottom: 6 }, 6: { top: 0, bottom: 6 }, 7: { top: 0, bottom: 6 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 1
  {
    rooms: [
      [28, 3, 2, 6, 21, 10, 0, 1, 0], // Level 0
      [0, 26, 0, 0, 23, 18, 0, 16, 0], // Level 1
      [11, 9, 0, 0, 14, 0, 8, 29, 0], // Level 2
      [0, 0, 5, 24, 7, 0, 0, 19, 0], // Level 3
      [0, 15, 22, 27, 13, 17, 0, 31, 0], // Level 4
      [0, 32, 4, 25, 30, 20, 0, 0, 12], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 5 }, 2: { top: 0, bottom: 6 }, 3: { top: 0, bottom: 6 }, 4: { top: 0, bottom: 5 },
      5: { top: 2, bottom: 6 }, 6: { top: 0, bottom: 6 }, 7: { top: 1, bottom: 5 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 2
  {
    rooms: [
      [11, 3, 9, 19, 0, 13, 12, 4, 0], // Level 0
      [0, 32, 0, 25, 0, 5, 26, 7, 0], // Level 1
      [0, 17, 0, 30, 29, 6, 24, 10, 0], // Level 2
      [0, 0, 27, 14, 18, 16, 23, 28, 0], // Level 3
      [0, 0, 0, 0, 0, 8, 31, 0, 0], // Level 4
      [1, 15, 20, 0, 0, 22, 2, 0, 21], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 6 }, 2: { top: 0, bottom: 6 }, 3: { top: 0, bottom: 6 }, 4: { top: 2, bottom: 4 },
      5: { top: 0, bottom: 6 }, 6: { top: 0, bottom: 6 }, 7: { top: 0, bottom: 6 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 3
  {
    rooms: [
      [1, 8, 17, 6, 23, 13, 25, 0, 12], // Level 0
      [0, 5, 20, 24, 10, 30, 32, 4, 21], // Level 1
      [0, 11, 7, 9, 14, 29, 0, 31, 0], // Level 2
      [0, 0, 27, 0, 3, 28, 15, 0, 0], // Level 3
      [0, 0, 0, 0, 18, 19, 26, 0, 0], // Level 4
      [0, 0, 0, 0, 16, 0, 22, 2, 0], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 2 }, 2: { top: 0, bottom: 3 }, 3: { top: 0, bottom: 4 }, 4: { top: 0, bottom: 6 },
      5: { top: 0, bottom: 6 }, 6: { top: 0, bottom: 6 }, 7: { top: 1, bottom: 6 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 4
  {
    rooms: [
      [10, 17, 30, 0, 0, 21, 24, 23, 0], // Level 0
      [18, 0, 0, 12, 20, 4, 0, 0, 0], // Level 1
      [32, 15, 0, 27, 0, 9, 0, 22, 0], // Level 2
      [0, 0, 5, 16, 0, 8, 0, 29, 25], // Level 3
      [0, 0, 14, 2, 0, 11, 3, 19, 6], // Level 4
      [0, 0, 28, 7, 0, 13, 1, 31, 26], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 3 }, 2: { top: 0, bottom: 5 }, 3: { top: 0, bottom: 6 }, 4: { top: 1, bottom: 6 },
      5: { top: 0, bottom: 6 }, 6: { top: 0, bottom: 6 }, 7: { top: 0, bottom: 6 }, 8: { top: 2, bottom: 6 },
    },
  },
  // Map 5
  {
    rooms: [
      [1, 13, 9, 0, 31, 0, 10, 0, 21], // Level 0
      [0, 23, 18, 0, 2, 22, 0, 0, 0], // Level 1
      [0, 0, 27, 17, 6, 0, 20, 0, 12], // Level 2
      [0, 15, 32, 14, 0, 24, 7, 29, 0], // Level 3
      [0, 11, 0, 16, 5, 0, 0, 26, 0], // Level 4
      [0, 30, 8, 19, 4, 28, 3, 0, 25], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 4 }, 2: { top: 0, bottom: 6 }, 3: { top: 0, bottom: 6 }, 4: { top: 0, bottom: 6 },
      5: { top: 1, bottom: 6 }, 6: { top: 1, bottom: 6 }, 7: { top: 0, bottom: 6 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 6
  {
    rooms: [
      [27, 0, 9, 28, 14, 7, 31, 0, 12], // Level 0
      [0, 0, 0, 32, 1, 17, 21, 0, 0], // Level 1
      [0, 8, 0, 3, 26, 19, 4, 0, 0], // Level 2
      [10, 11, 20, 16, 30, 6, 29, 0, 0], // Level 3
      [0, 23, 0, 13, 0, 2, 0, 24, 0], // Level 4
      [0, 25, 18, 5, 0, 15, 0, 22, 0], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 6 }, 2: { top: 0, bottom: 4 }, 3: { top: 0, bottom: 6 }, 4: { top: 0, bottom: 6 },
      5: { top: 0, bottom: 6 }, 6: { top: 0, bottom: 6 }, 7: { top: 2, bottom: 6 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 7
  {
    rooms: [
      [11, 0, 8, 0, 12, 0, 15, 0, 25], // Level 0
      [0, 18, 21, 13, 31, 9, 0, 24, 0], // Level 1
      [10, 29, 0, 7, 0, 20, 17, 27, 0], // Level 2
      [0, 0, 2, 14, 0, 1, 4, 23, 0], // Level 3
      [0, 5, 3, 22, 16, 0, 6, 0, 0], // Level 4
      [0, 0, 30, 19, 28, 0, 0, 32, 26], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 5 }, 2: { top: 0, bottom: 5 }, 3: { top: 0, bottom: 6 }, 4: { top: 0, bottom: 5 },
      5: { top: 1, bottom: 6 }, 6: { top: 0, bottom: 5 }, 7: { top: 0, bottom: 4 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 8
  {
    rooms: [
      [10, 29, 23, 28, 15, 0, 26, 16, 0], // Level 0
      [0, 0, 17, 5, 11, 0, 27, 12, 0], // Level 1
      [0, 13, 30, 7, 0, 19, 0, 0, 0], // Level 2
      [0, 0, 24, 18, 6, 20, 0, 9, 0], // Level 3
      [0, 25, 1, 8, 32, 14, 4, 0, 0], // Level 4
      [0, 0, 31, 22, 0, 0, 3, 2, 21], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 5 }, 2: { top: 0, bottom: 6 }, 3: { top: 1, bottom: 6 }, 4: { top: 0, bottom: 6 },
      5: { top: 0, bottom: 5 }, 6: { top: 0, bottom: 6 }, 7: { top: 0, bottom: 6 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 9
  {
    rooms: [
      [18, 4, 14, 1, 27, 23, 0, 3, 0], // Level 0
      [0, 7, 32, 0, 12, 0, 0, 21, 25], // Level 1
      [30, 31, 26, 0, 17, 0, 20, 10, 0], // Level 2
      [0, 0, 0, 0, 15, 5, 0, 0, 0], // Level 3
      [28, 9, 0, 29, 2, 24, 8, 16, 0], // Level 4
      [0, 0, 0, 22, 19, 6, 13, 11, 0], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 5 }, 2: { top: 0, bottom: 5 }, 3: { top: 0, bottom: 6 }, 4: { top: 0, bottom: 6 },
      5: { top: 0, bottom: 6 }, 6: { top: 2, bottom: 6 }, 7: { top: 0, bottom: 6 }, 8: { top: 0, bottom: 6 },
    },
  },
  // Map 10
  {
    rooms: [
      [32, 25, 4, 29, 24, 16, 0, 13, 6], // Level 0
      [0, 22, 17, 0, 30, 5, 2, 3, 0], // Level 1
      [0, 9, 23, 0, 0, 0, 20, 8, 0], // Level 2
      [0, 0, 18, 0, 0, 27, 10, 15, 0], // Level 3
      [0, 14, 28, 12, 0, 0, 26, 0, 19], // Level 4
      [0, 11, 1, 31, 0, 0, 0, 7, 21], // Level 5
    ],
    elevators: {
      1: { top: 0, bottom: 5 }, 2: { top: 0, bottom: 6 }, 3: { top: 0, bottom: 6 }, 4: { top: 0, bottom: 1 },
      5: { top: 0, bottom: 2 }, 6: { top: 0, bottom: 5 }, 7: { top: 0, bottom: 6 }, 8: { top: 0, bottom: 6 },
    },
  },
];

/**
 * The tower password for each map, indexed by map id (0-based, so
 * passwords[mapId] is always correct — the original indexed these
 * with an extra -1, which crashed on map 0 and shifted every other
 * map to its neighbor's password). The original ships repeats for
 * maps 8-10.
 */
export const passwords = [
  "ARTICHOKE",
  "CROCODILE",
  "CORMORANT",
  "SWORDFISH",
  "ASPARAGUS",
  "ALLIGATOR",
  "ALBATROSS",
  "BUTTERFLY",
  "ARTICHOKE",
  "CROCODILE",
  "CORMORANT",
];

/**
 * Display names of the robot behavior types, indexed by type id.
 * (The original also defined "Induced meandering" and "Slingshot
 * patrolling" but had them commented out as inactive.)
 */
export const robotTypes = [
  "Observation only",
  "Simple meandering",
  "Meandering",
  "Patrolling",
  "Patrolling zap",
  "Smart patrolling",
  "Smart patrolling zap",
  "Askance patrolling",
  "Left-to-right zapping",
  "Platform-edge zapping",
  "Berserker zapping",
  "Continuous zapping",
];

/**
 * Elevator color schemes for each of the 8 elevator shafts.
 *
 * bg: Background color index
 * bo: Border color index
 */
export const elevatorColors: Record<number, ElevatorColor> = {
  1: { bg: 10, bo: 2 },
  2: { bg: 7, bo: 4 },
  3: { bg: 15, bo: 12 },
  4: { bg: 1, bo: 13 },
  5: { bg: 13, bo: 5 },
  6: { bg: 3, bo: 6 },
  7: { bg: 9, bo: 8 },
  8: { bg: 7, bo: 14 },
};

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
 * Room color definitions.
 *
 * bg: Background color of the room
 * pb: platform border
 * pg: platform background (and lift pattern, terminal desk)
 * ps: platform surface
 * ls: lift surface
 * db: robot background
 * dt: robot tools
 * dl1, dl2: robot lights
 */
export const roomColors: Record<number, RoomColor> = {
  1: { bg: 5, pb: 7, pg: 14, ps: 1, ls: 7, db: 7, dt: 0, dl1: 1, dl2: 11 },
  2: { bg: 7, pb: 2, pg: 8, ps: 1, ls: 1, db: 10, dt: 1, dl1: 0, dl2: 7 },
  3: { bg: 5, pb: 1, pg: 12, ps: 7, ls: 7, db: 14, dt: 6, dl1: 3, dl2: 0 },
  4: { bg: 7, pb: 3, pg: 14, ps: 1, ls: 7, db: 11, dt: 0, dl1: 7, dl2: 2 },
  5: { bg: 3, pb: 4, pg: 14, ps: 1, ls: 7, db: 5, dt: 7, dl1: 10, dl2: 2 },
  6: { bg: 7, pb: 2, pg: 10, ps: 8, ls: 1, db: 9, dt: 1, dl1: 0, dl2: 1 },
  7: { bg: 5, pb: 6, pg: 14, ps: 15, ls: 7, db: 8, dt: 7, dl1: 2, dl2: 4 },
  8: { bg: 7, pb: 6, pg: 14, ps: 1, ls: 1, db: 5, dt: 3, dl1: 13, dl2: 10 },
  9: { bg: 5, pb: 7, pg: 9, ps: 15, ls: 7, db: 1, dt: 14, dl1: 4, dl2: 14 },
  10: { bg: 5, pb: 6, pg: 14, ps: 1, ls: 7, db: 6, dt: 3, dl1: 13, dl2: 0 },
  11: { bg: 7, pb: 3, pg: 12, ps: 1, ls: 1, db: 8, dt: 0, dl1: 2, dl2: 1 },
  12: { bg: 3, pb: 4, pg: 10, ps: 1, ls: 7, db: 1, dt: 6, dl1: 10, dl2: 2 },
  13: { bg: 3, pb: 7, pg: 9, ps: 1, ls: 7, db: 6, dt: 14, dl1: 1, dl2: 14 },
  14: { bg: 5, pb: 3, pg: 14, ps: 1, ls: 7, db: 0, dt: 3, dl1: 7, dl2: 1 },
  15: { bg: 3, pb: 7, pg: 14, ps: 1, ls: 7, db: 14, dt: 1, dl1: 6, dl2: 4 },
  16: { bg: 7, pb: 4, pg: 2, ps: 15, ls: 1, db: 9, dt: 1, dl1: 7, dl2: 10 },
  17: { bg: 3, pb: 7, pg: 9, ps: 14, ls: 7, db: 1, dt: 0, dl1: 4, dl2: 6 },
  18: { bg: 3, pb: 0, pg: 12, ps: 14, ls: 7, db: 6, dt: 1, dl1: 14, dl2: 7 },
  19: { bg: 3, pb: 2, pg: 8, ps: 1, ls: 7, db: 1, dt: 4, dl1: 7, dl2: 8 },
  20: { bg: 3, pb: 7, pg: 9, ps: 1, ls: 7, db: 6, dt: 14, dl1: 10, dl2: 9 },
  21: { bg: 5, pb: 6, pg: 15, ps: 1, ls: 7, db: 6, dt: 1, dl1: 6, dl2: 13 },
  22: { bg: 3, pb: 7, pg: 8, ps: 1, ls: 7, db: 14, dt: 1, dl1: 13, dl2: 5 },
  23: { bg: 5, pb: 7, pg: 2, ps: 12, ls: 7, db: 3, dt: 10, dl1: 0, dl2: 1 },
  24: { bg: 7, pb: 0, pg: 2, ps: 12, ls: 1, db: 10, dt: 9, dl1: 1, dl2: 2 },
  25: { bg: 3, pb: 4, pg: 14, ps: 1, ls: 7, db: 1, dt: 10, dl1: 6, dl2: 3 },
  26: { bg: 3, pb: 1, pg: 5, ps: 13, ls: 7, db: 7, dt: 8, dl1: 14, dl2: 6 },
  27: { bg: 3, pb: 1, pg: 9, ps: 15, ls: 7, db: 0, dt: 8, dl1: 1, dl2: 7 },
  28: { bg: 5, pb: 3, pg: 14, ps: 1, ls: 7, db: 7, dt: 8, dl1: 6, dl2: 3 },
  29: { bg: 7, pb: 2, pg: 10, ps: 1, ls: 1, db: 2, dt: 10, dl1: 4, dl2: 1 },
  30: { bg: 5, pb: 6, pg: 14, ps: 13, ls: 7, db: 0, dt: 11, dl1: 1, dl2: 3 },
  31: { bg: 3, pb: 6, pg: 12, ps: 14, ls: 1, db: 0, dt: 0, dl1: 0, dl2: 0 },
  32: { bg: 7, pb: 6, pg: 12, ps: 14, ls: 1, db: 0, dt: 0, dl1: 0, dl2: 0 },
};

/**
 * Platform definitions for each room.
 *
 * x, y: Position in grid coordinates (multiply by 8 for pixels)
 * l: Length in segments (how many 8x8 tiles)
 * p: Pattern (0 or 1, determines alternating sprite tiles)
 */
export const roomPlatforms = {
  1: [
    { x: 4, y: 6, l: 15, p: 1 },
    { x: 22, y: 9, l: 14, p: 0 },
    { x: 4, y: 12, l: 15, p: 1 },
    { x: 22, y: 15, l: 14, p: 0 },
    { x: 4, y: 18, l: 15, p: 1 },
    { x: 4, y: 24, l: 15, p: 1 },
    { x: 22, y: 24, l: 18, p: 1 },
  ],
  2: [
    { x: 18, y: 6, l: 18, p: 0 },
    { x: 1, y: 12, l: 6, p: 0 },
    { x: 18, y: 12, l: 3, p: 1 },
    { x: 33, y: 12, l: 3, p: 1 },
    { x: 1, y: 18, l: 3, p: 1 },
    { x: 7, y: 18, l: 8, p: 0 },
    { x: 18, y: 18, l: 3, p: 1 },
    { x: 0, y: 24, l: 4, p: 0 },
    { x: 18, y: 24, l: 3, p: 1 },
    { x: 33, y: 24, l: 6, p: 0 },
  ],
  3: [
    { x: 0, y: 6, l: 4, p: 0 },
    { x: 7, y: 6, l: 3, p: 1 },
    { x: 13, y: 6, l: 3, p: 1 },
    { x: 19, y: 6, l: 3, p: 1 },
    { x: 25, y: 6, l: 4, p: 0 },
    { x: 32, y: 6, l: 7, p: 1 },
    { x: 1, y: 12, l: 3, p: 1 },
    { x: 7, y: 12, l: 3, p: 1 },
    { x: 13, y: 12, l: 3, p: 1 },
    { x: 19, y: 12, l: 3, p: 1 },
    { x: 25, y: 12, l: 4, p: 0 },
    { x: 32, y: 12, l: 7, p: 1 },
    { x: 1, y: 18, l: 3, p: 1 },
    { x: 7, y: 18, l: 3, p: 1 },
    { x: 13, y: 18, l: 3, p: 1 },
    { x: 19, y: 18, l: 3, p: 1 },
    { x: 25, y: 18, l: 4, p: 0 },
    { x: 32, y: 18, l: 7, p: 1 },
    { x: 1, y: 24, l: 3, p: 1 },
    { x: 7, y: 24, l: 3, p: 1 },
    { x: 13, y: 24, l: 3, p: 1 },
    { x: 19, y: 24, l: 3, p: 1 },
    { x: 25, y: 24, l: 4, p: 0 },
    { x: 32, y: 24, l: 8, p: 1 },
  ],
  4: [
    { x: 0, y: 6, l: 5, p: 1 },
    { x: 19, y: 6, l: 4, p: 0 },
    { x: 31, y: 6, l: 9, p: 0 },
    { x: 10, y: 9, l: 6, p: 0 },
    { x: 27, y: 9, l: 3, p: 1 },
    { x: 1, y: 12, l: 5, p: 1 },
    { x: 19, y: 12, l: 4, p: 0 },
    { x: 36, y: 12, l: 3, p: 1 },
    { x: 11, y: 15, l: 4, p: 0 },
    { x: 27, y: 15, l: 3, p: 1 },
    { x: 1, y: 18, l: 6, p: 0 },
    { x: 19, y: 18, l: 4, p: 0 },
    { x: 33, y: 20, l: 3, p: 1 },
    { x: 12, y: 21, l: 3, p: 1 },
    { x: 1, y: 24, l: 7, p: 1 },
    { x: 19, y: 24, l: 4, p: 0 },
    { x: 30, y: 24, l: 3, p: 1 },
  ],
  5: [
    { x: 1, y: 6, l: 9, p: 1 },
    { x: 13, y: 6, l: 14, p: 0 },
    { x: 30, y: 6, l: 10, p: 1 },
    { x: 4, y: 12, l: 6, p: 0 },
    { x: 13, y: 12, l: 14, p: 0 },
    { x: 30, y: 12, l: 6, p: 0 },
    { x: 4, y: 18, l: 14, p: 0 },
    { x: 21, y: 18, l: 15, p: 1 },
    { x: 0, y: 24, l: 18, p: 0 },
    { x: 21, y: 24, l: 18, p: 0 },
  ],
  6: [
    { x: 0, y: 6, l: 18, p: 0 },
    { x: 21, y: 6, l: 18, p: 0 },
    { x: 1, y: 12, l: 17, p: 1 },
    { x: 21, y: 12, l: 18, p: 0 },
    { x: 1, y: 18, l: 17, p: 1 },
    { x: 21, y: 18, l: 18, p: 0 },
    { x: 1, y: 24, l: 17, p: 1 },
    { x: 21, y: 24, l: 18, p: 0 },
  ],
  7: [
    { x: 7, y: 6, l: 9, p: 1 },
    { x: 28, y: 6, l: 5, p: 1 },
    { x: 36, y: 6, l: 4, p: 1 },
    { x: 19, y: 12, l: 14, p: 0 },
    { x: 36, y: 12, l: 3, p: 1 },
    { x: 7, y: 18, l: 9, p: 1 },
    { x: 28, y: 18, l: 5, p: 1 },
    { x: 0, y: 24, l: 4, p: 0 },
    { x: 7, y: 24, l: 26, p: 0 },
    { x: 36, y: 24, l: 3, p: 1 },
  ],
  8: [
    { x: 0, y: 6, l: 20, p: 0 },
    { x: 23, y: 6, l: 8, p: 0 },
    { x: 34, y: 6, l: 6, p: 1 },
    { x: 1, y: 12, l: 19, p: 1 },
    { x: 23, y: 12, l: 8, p: 0 },
    { x: 34, y: 12, l: 5, p: 1 },
    { x: 1, y: 18, l: 4, p: 0 },
    { x: 8, y: 18, l: 2, p: 0 },
    { x: 13, y: 18, l: 2, p: 0 },
    { x: 18, y: 18, l: 2, p: 0 },
    { x: 23, y: 18, l: 8, p: 0 },
    { x: 34, y: 18, l: 5, p: 1 },
    { x: 1, y: 24, l: 4, p: 0 },
    { x: 8, y: 24, l: 2, p: 0 },
    { x: 13, y: 24, l: 2, p: 0 },
    { x: 18, y: 24, l: 21, p: 1 },
  ],
  9: [
    { x: 1, y: 6, l: 20, p: 0 },
    { x: 24, y: 6, l: 7, p: 1 },
    { x: 34, y: 6, l: 6, p: 1 },
    { x: 4, y: 12, l: 7, p: 1 },
    { x: 14, y: 12, l: 7, p: 1 },
    { x: 24, y: 12, l: 7, p: 1 },
    { x: 34, y: 12, l: 5, p: 1 },
    { x: 4, y: 18, l: 7, p: 1 },
    { x: 14, y: 18, l: 7, p: 1 },
    { x: 24, y: 18, l: 7, p: 1 },
    { x: 34, y: 18, l: 5, p: 1 },
    { x: 14, y: 24, l: 25, p: 1 },
    { x: 4, y: 24, l: 7, p: 1 },
    { x: 0, y: 24, l: 1, p: 0 },
  ],
  10: [
    { x: 4, y: 6, l: 17, p: 1 },
    { x: 30, y: 6, l: 10, p: 1 },
    { x: 4, y: 12, l: 19, p: 1 },
    { x: 29, y: 12, l: 7, p: 1 },
    { x: 4, y: 18, l: 21, p: 1 },
    { x: 29, y: 18, l: 7, p: 1 },
    { x: 4, y: 24, l: 23, p: 1 },
    { x: 29, y: 24, l: 7, p: 1 },
  ],
  11: [
    { x: 4, y: 6, l: 14, p: 0 },
    { x: 21, y: 6, l: 15, p: 1 },
    { x: 4, y: 12, l: 14, p: 0 },
    { x: 21, y: 12, l: 15, p: 1 },
    { x: 4, y: 18, l: 14, p: 0 },
    { x: 21, y: 18, l: 15, p: 1 },
    { x: 4, y: 24, l: 14, p: 0 },
    { x: 21, y: 24, l: 15, p: 1 },
    { x: 39, y: 24, l: 1, p: 0 },
  ],
  12: [
    { x: 4, y: 6, l: 32, p: 0 },
    { x: 4, y: 12, l: 32, p: 0 },
    { x: 4, y: 18, l: 32, p: 0 },
    { x: 0, y: 24, l: 1, p: 1 },
    { x: 4, y: 24, l: 32, p: 0 },
  ],
  13: [
    { x: 0, y: 6, l: 10, p: 0 },
    { x: 13, y: 6, l: 2, p: 0 },
    { x: 18, y: 6, l: 2, p: 0 },
    { x: 23, y: 6, l: 10, p: 0 },
    { x: 5, y: 12, l: 5, p: 1 },
    { x: 13, y: 12, l: 2, p: 0 },
    { x: 18, y: 12, l: 2, p: 0 },
    { x: 23, y: 12, l: 13, p: 1 },
    { x: 1, y: 18, l: 9, p: 1 },
    { x: 13, y: 18, l: 2, p: 0 },
    { x: 18, y: 18, l: 2, p: 0 },
    { x: 23, y: 18, l: 2, p: 0 },
    { x: 28, y: 18, l: 11, p: 1 },
    { x: 1, y: 24, l: 24, p: 0 },
    { x: 33, y: 24, l: 7, p: 0 },
  ],
  14: [
    { x: 1, y: 6, l: 4, p: 0 },
    { x: 29, y: 6, l: 10, p: 0 },
    { x: 8, y: 9, l: 18, p: 0 },
    { x: 29, y: 12, l: 10, p: 0 },
    { x: 17, y: 15, l: 9, p: 1 },
    { x: 4, y: 18, l: 10, p: 0 },
    { x: 29, y: 18, l: 10, p: 0 },
    { x: 0, y: 24, l: 1, p: 1 },
    { x: 4, y: 24, l: 22, p: 0 },
    { x: 29, y: 24, l: 11, p: 0 },
  ],
  15: [
    { x: 0, y: 6, l: 3, p: 1 },
    { x: 6, y: 6, l: 1, p: 1 },
    { x: 10, y: 6, l: 1, p: 1 },
    { x: 14, y: 6, l: 26, p: 1 },
    { x: 14, y: 12, l: 22, p: 0 },
    { x: 14, y: 18, l: 11, p: 1 },
    { x: 29, y: 18, l: 7, p: 1 },
    { x: 25, y: 21, l: 4, p: 0 },
    { x: 1, y: 24, l: 2, p: 0 },
    { x: 6, y: 24, l: 1, p: 1 },
    { x: 10, y: 24, l: 1, p: 1 },
    { x: 14, y: 24, l: 11, p: 1 },
    { x: 29, y: 24, l: 10, p: 0 },
  ],
  16: [
    { x: 25, y: 4, l: 11, p: 1 },
    { x: 4, y: 6, l: 11, p: 1 },
    { x: 24, y: 9, l: 12, p: 0 },
    { x: 24, y: 14, l: 12, p: 0 },
    { x: 4, y: 16, l: 10, p: 0 },
    { x: 20, y: 19, l: 14, p: 0 },
    { x: 0, y: 24, l: 1, p: 0 },
    { x: 4, y: 24, l: 11, p: 1 },
    { x: 18, y: 24, l: 22, p: 1 },
  ],
  17: [
    { x: 0, y: 6, l: 1, p: 0 },
    { x: 4, y: 6, l: 32, p: 0 },
    { x: 4, y: 12, l: 32, p: 0 },
    { x: 4, y: 18, l: 32, p: 0 },
    { x: 4, y: 24, l: 32, p: 0 },
    { x: 39, y: 24, l: 1, p: 0 },
  ],
  18: [
    { x: 1, y: 6, l: 17, p: 1 },
    { x: 21, y: 6, l: 19, p: 0 },
    { x: 1, y: 12, l: 8, p: 0 },
    { x: 12, y: 12, l: 6, p: 0 },
    { x: 21, y: 12, l: 8, p: 0 },
    { x: 32, y: 12, l: 7, p: 1 },
    { x: 1, y: 18, l: 8, p: 0 },
    { x: 12, y: 18, l: 17, p: 1 },
    { x: 32, y: 18, l: 7, p: 1 },
    { x: 1, y: 24, l: 8, p: 0 },
    { x: 12, y: 24, l: 17, p: 1 },
    { x: 32, y: 24, l: 7, p: 1 },
  ],
  19: [
    { x: 4, y: 4, l: 4, p: 0 },
    { x: 14, y: 6, l: 3, p: 1 },
    { x: 29, y: 6, l: 10, p: 0 },
    { x: 11, y: 9, l: 3, p: 1 },
    { x: 26, y: 9, l: 3, p: 1 },
    { x: 8, y: 12, l: 3, p: 1 },
    { x: 23, y: 12, l: 3, p: 1 },
    { x: 29, y: 12, l: 7, p: 1 },
    { x: 4, y: 14, l: 4, p: 0 },
    { x: 23, y: 18, l: 13, p: 1 },
    { x: 0, y: 24, l: 3, p: 1 },
    { x: 6, y: 24, l: 11, p: 1 },
    { x: 23, y: 24, l: 13, p: 1 },
  ],
  20: [
    { x: 0, y: 6, l: 5, p: 1 },
    { x: 8, y: 6, l: 26, p: 0 },
    { x: 37, y: 6, l: 3, p: 0 },
    { x: 8, y: 12, l: 9, p: 1 },
    { x: 30, y: 12, l: 4, p: 0 },
    { x: 37, y: 12, l: 2, p: 0 },
    { x: 26, y: 15, l: 4, p: 0 },
    { x: 1, y: 18, l: 1, p: 1 },
    { x: 8, y: 18, l: 9, p: 1 },
    { x: 30, y: 18, l: 4, p: 0 },
    { x: 37, y: 18, l: 2, p: 0 },
    { x: 26, y: 21, l: 4, p: 0 },
    { x: 1, y: 24, l: 1, p: 1 },
    { x: 5, y: 24, l: 12, p: 0 },
    { x: 30, y: 24, l: 4, p: 0 },
    { x: 37, y: 24, l: 2, p: 0 },
  ],
  21: [
    { x: 0, y: 6, l: 21, p: 1 },
    { x: 24, y: 6, l: 2, p: 0 },
    { x: 29, y: 6, l: 10, p: 0 },
    { x: 1, y: 12, l: 10, p: 0 },
    { x: 14, y: 12, l: 2, p: 0 },
    { x: 19, y: 12, l: 2, p: 0 },
    { x: 24, y: 12, l: 2, p: 0 },
    { x: 29, y: 12, l: 10, p: 0 },
    { x: 4, y: 18, l: 2, p: 0 },
    { x: 9, y: 18, l: 2, p: 0 },
    { x: 14, y: 18, l: 2, p: 0 },
    { x: 19, y: 18, l: 20, p: 0 },
    { x: 4, y: 24, l: 2, p: 0 },
    { x: 9, y: 24, l: 30, p: 0 },
  ],
  22: [
    { x: 0, y: 6, l: 16, p: 0 },
    { x: 19, y: 6, l: 1, p: 1 },
    { x: 23, y: 6, l: 16, p: 0 },
    { x: 19, y: 12, l: 1, p: 1 },
    { x: 23, y: 12, l: 16, p: 0 },
    { x: 5, y: 13, l: 5, p: 1 },
    { x: 29, y: 17, l: 5, p: 1 },
    { x: 1, y: 18, l: 15, p: 1 },
    { x: 19, y: 18, l: 1, p: 1 },
    { x: 1, y: 24, l: 15, p: 1 },
    { x: 19, y: 24, l: 1, p: 1 },
    { x: 23, y: 24, l: 17, p: 0 },
  ],
  23: [
    { x: 0, y: 6, l: 36, p: 0 },
    { x: 1, y: 12, l: 7, p: 1 },
    { x: 11, y: 12, l: 8, p: 0 },
    { x: 22, y: 12, l: 7, p: 1 },
    { x: 32, y: 12, l: 4, p: 0 },
    { x: 11, y: 18, l: 8, p: 0 },
    { x: 22, y: 18, l: 7, p: 1 },
    { x: 32, y: 18, l: 7, p: 1 },
    { x: 1, y: 21, l: 4, p: 0 },
    { x: 4, y: 24, l: 35, p: 1 },
  ],
  24: [
    { x: 4, y: 6, l: 32, p: 0 },
    { x: 7, y: 12, l: 4, p: 0 },
    { x: 15, y: 12, l: 10, p: 0 },
    { x: 29, y: 12, l: 4, p: 0 },
    { x: 4, y: 18, l: 9, p: 1 },
    { x: 18, y: 18, l: 1, p: 1 },
    { x: 22, y: 18, l: 1, p: 1 },
    { x: 28, y: 18, l: 8, p: 0 },
    { x: 0, y: 24, l: 19, p: 1 },
    { x: 22, y: 24, l: 18, p: 1 },
  ],
  25: [
    { x: 4, y: 6, l: 3, p: 1 },
    { x: 9, y: 6, l: 2, p: 0 },
    { x: 13, y: 6, l: 2, p: 0 },
    { x: 17, y: 6, l: 2, p: 0 },
    { x: 21, y: 6, l: 2, p: 0 },
    { x: 25, y: 6, l: 2, p: 0 },
    { x: 29, y: 6, l: 10, p: 0 },
    { x: 4, y: 12, l: 32, p: 0 },
    { x: 4, y: 18, l: 10, p: 0 },
    { x: 19, y: 18, l: 3, p: 1 },
    { x: 27, y: 18, l: 9, p: 1 },
    { x: 0, y: 24, l: 1, p: 1 },
    { x: 4, y: 24, l: 35, p: 1 },
  ],
  26: [
    { x: 0, y: 6, l: 4, p: 0 },
    { x: 7, y: 6, l: 3, p: 1 },
    { x: 13, y: 6, l: 3, p: 1 },
    { x: 19, y: 6, l: 3, p: 1 },
    { x: 25, y: 6, l: 3, p: 1 },
    { x: 31, y: 6, l: 3, p: 1 },
    { x: 36, y: 9, l: 3, p: 1 },
    { x: 1, y: 12, l: 3, p: 1 },
    { x: 7, y: 12, l: 3, p: 1 },
    { x: 13, y: 12, l: 3, p: 1 },
    { x: 19, y: 12, l: 3, p: 1 },
    { x: 25, y: 12, l: 3, p: 1 },
    { x: 31, y: 12, l: 3, p: 1 },
    { x: 36, y: 15, l: 3, p: 1 },
    { x: 1, y: 18, l: 3, p: 1 },
    { x: 7, y: 18, l: 3, p: 1 },
    { x: 13, y: 18, l: 3, p: 1 },
    { x: 19, y: 18, l: 3, p: 1 },
    { x: 25, y: 18, l: 3, p: 1 },
    { x: 31, y: 18, l: 3, p: 1 },
    { x: 36, y: 21, l: 3, p: 1 },
    { x: 1, y: 24, l: 3, p: 1 },
    { x: 7, y: 24, l: 3, p: 1 },
    { x: 13, y: 24, l: 3, p: 1 },
    { x: 19, y: 24, l: 3, p: 1 },
    { x: 25, y: 24, l: 3, p: 1 },
    { x: 31, y: 24, l: 3, p: 1 },
  ],
  27: [
    { x: 29, y: 4, l: 10, p: 0 },
    { x: 1, y: 5, l: 12, p: 0 },
    { x: 15, y: 7, l: 10, p: 0 },
    { x: 27, y: 9, l: 12, p: 0 },
    { x: 4, y: 10, l: 9, p: 1 },
    { x: 15, y: 12, l: 10, p: 0 },
    { x: 4, y: 15, l: 9, p: 1 },
    { x: 27, y: 15, l: 12, p: 0 },
    { x: 15, y: 18, l: 10, p: 0 },
    { x: 4, y: 21, l: 9, p: 1 },
    { x: 14, y: 24, l: 26, p: 1 },
  ],
  28: [
    { x: 4, y: 6, l: 3, p: 1 },
    { x: 35, y: 6, l: 5, p: 0 },
    { x: 9, y: 9, l: 6, p: 0 },
    { x: 25, y: 9, l: 6, p: 0 },
    { x: 4, y: 12, l: 3, p: 1 },
    { x: 17, y: 12, l: 6, p: 0 },
    { x: 33, y: 12, l: 6, p: 0 },
    { x: 9, y: 15, l: 6, p: 0 },
    { x: 25, y: 15, l: 6, p: 0 },
    { x: 4, y: 18, l: 3, p: 1 },
    { x: 17, y: 18, l: 6, p: 0 },
    { x: 9, y: 21, l: 6, p: 0 },
    { x: 25, y: 21, l: 14, p: 0 },
    { x: 4, y: 24, l: 3, p: 1 },
    { x: 15, y: 24, l: 8, p: 0 },
  ],
  29: [
    { x: 24, y: 3, l: 3, p: 1 },
    { x: 1, y: 5, l: 5, p: 1 },
    { x: 13, y: 6, l: 3, p: 1 },
    { x: 30, y: 6, l: 9, p: 1 },
    { x: 10, y: 9, l: 3, p: 1 },
    { x: 20, y: 9, l: 3, p: 1 },
    { x: 7, y: 12, l: 3, p: 1 },
    { x: 26, y: 12, l: 13, p: 1 },
    { x: 4, y: 15, l: 3, p: 1 },
    { x: 16, y: 15, l: 3, p: 1 },
    { x: 1, y: 18, l: 3, p: 1 },
    { x: 22, y: 18, l: 17, p: 1 },
    { x: 0, y: 24, l: 4, p: 0 },
    { x: 7, y: 24, l: 3, p: 1 },
    { x: 13, y: 24, l: 3, p: 1 },
    { x: 25, y: 24, l: 3, p: 1 },
    { x: 31, y: 24, l: 3, p: 1 },
    { x: 37, y: 24, l: 3, p: 1 },
  ],
  30: [
    { x: 35, y: 6, l: 5, p: 0 },
    { x: 14, y: 8, l: 14, p: 0 },
    { x: 1, y: 10, l: 2, p: 0 },
    { x: 1, y: 13, l: 2, p: 0 },
    { x: 9, y: 13, l: 22, p: 0 },
    { x: 34, y: 13, l: 5, p: 1 },
    { x: 1, y: 19, l: 5, p: 1 },
    { x: 9, y: 19, l: 22, p: 0 },
    { x: 34, y: 19, l: 5, p: 1 },
    { x: 1, y: 24, l: 5, p: 1 },
    { x: 9, y: 24, l: 22, p: 0 },
    { x: 34, y: 24, l: 5, p: 1 },
  ],
  31: [{ x: 0, y: 24, l: 39, p: 1 }],
  32: [{ x: 1, y: 24, l: 39, p: 0 }],
};

/**
 * Inner lift definitions for each room.
 *
 * l: Left coordinate (0-39, horizontal position)
 * s: stations
 *
 * Stations which are the vertical positions where lifts
 * can stop. Negative values indicate starting positions
 * without a lift.
 */
export const innerLifts = {
  1: [
    { l: 1, s: [6, 12, -18, -24] },
    { l: 19, s: [-6, -9, -12, -15, 18, -21, 24] },
    { l: 36, s: [-9, 15] },
  ],
  2: [
    { l: 4, s: [-18, 24] },
    { l: 15, s: [6, 12, 18, -24] },
    { l: 21, s: [-12, 18, 24] },
    { l: 36, s: [-6, 12] },
  ],
  3: [
    { l: 4, s: [6, 12, -18, -24] },
    { l: 10, s: [-6, 12, 18, -24] },
    { l: 16, s: [-6, -12, 18, 24] },
    { l: 22, s: [-6, -12, 18, 24] },
    { l: 29, s: [-6, 12, 18, -24] },
  ],
  4: [],
  5: [
    { l: 1, s: [-12, 18] },
    { l: 10, s: [-6, 12] },
    { l: 18, s: [-18, 24] },
    { l: 27, s: [-6, 12] },
    { l: 36, s: [-12, 18] },
  ],
  6: [{ l: 18, s: [6, -12, -18, -24] }],
  7: [
    { l: 4, s: [-6, -18, 24] },
    { l: 16, s: [6, -18] },
    { l: 33, s: [-6, -12, -18, 24] },
  ],
  8: [
    { l: 5, s: [18, -24] },
    { l: 10, s: [18, -24] },
    { l: 15, s: [18, -24] },
    { l: 20, s: [6, 12, -18] },
    { l: 31, s: [6, 12, -18] },
  ],
  9: [
    { l: 1, s: [-12, 18, 24] },
    { l: 11, s: [-12, 18, 24] },
    { l: 21, s: [-6, 12, 18] },
    { l: 31, s: [-6, 12, 18] },
  ],
  10: [
    { l: 1, s: [-6, -12, -18, 24] },
    { l: 36, s: [-12, -18, 24] },
  ],
  11: [
    { l: 1, s: [-6, 12, 18, 24] },
    { l: 18, s: [-6, 12, 18, 24] },
    { l: 36, s: [-6, 12, 18, 24] },
  ],
  12: [
    { l: 1, s: [-6, -12, 18, 24] },
    { l: 36, s: [-6, 12, 18, 24] },
  ],
  13: [
    { l: 10, s: [6, 12, -18] },
    { l: 15, s: [-6, 12, 18] },
    { l: 20, s: [6, 12, -18] },
    { l: 25, s: [-18, 24] },
  ],
  14: [
    { l: 1, s: [-18, 24] },
    { l: 14, s: [-15, 18] },
    { l: 26, s: [-6, -9, -12, 15, -18, -24] },
  ],
  15: [
    { l: 3, s: [-6, 24] },
    { l: 7, s: [-6, 24] },
    { l: 11, s: [-6, 24] },
    { l: 36, s: [-12, 18] },
  ],
  16: [
    { l: 1, s: [-6, -16, 24] },
    { l: 15, s: [6, -24] },
  ],
  17: [
    { l: 1, s: [6, 12, -18, -24] },
    { l: 36, s: [-6, 12, 18, 24] },
  ],
  18: [
    { l: 9, s: [12, 18, -24] },
    { l: 18, s: [6, -12] },
    { l: 29, s: [12, 18, -24] },
  ],
  19: [
    { l: 1, s: [-4, 14] },
    { l: 3, s: [-19, 24] },
    { l: 17, s: [-6, -12, 18, 24] },
    { l: 20, s: [-12, 18, 24] },
    { l: 36, s: [12, 18, -24] },
  ],
  20: [
    { l: 2, s: [18, -24] },
    { l: 5, s: [6, -12, -18] },
    { l: 23, s: [15, -21] },
    { l: 34, s: [6, -12, -18, -24] },
  ],
  21: [
    { l: 1, s: [-18, 24] },
    { l: 6, s: [-18, 24] },
    { l: 11, s: [-12, 18] },
    { l: 16, s: [-12, 18] },
    { l: 21, s: [-6, 12] },
    { l: 26, s: [-6, 12] },
  ],
  22: [
    { l: 16, s: [6, -12, -18, -24] },
    { l: 20, s: [-6, -12, -18, 24] },
  ],
  23: [
    { l: 8, s: [12, -18] },
    { l: 19, s: [12, -18] },
    { l: 29, s: [12, -18] },
    { l: 36, s: [6, -12] },
  ],
  24: [
    { l: 1, s: [-6, 12, 18] },
    { l: 19, s: [-18, 24] },
    { l: 36, s: [-6, 12, 18] },
  ],
  25: [
    { l: 1, s: [-6, 12] },
    { l: 1, s: [-18, 24] },
    { l: 36, s: [-12, 18] },
  ],
  26: [
    { l: 4, s: [6, 12, -18, -24] },
    { l: 10, s: [-6, 12, 18, -24] },
    { l: 16, s: [-6, -12, 18, 24] },
    { l: 22, s: [6, 12, -18, -24] },
    { l: 28, s: [6, 12, 18, -24] },
  ],
  27: [{ l: 1, s: [-10, -15, 21] }],
  28: [{ l: 1, s: [6, -12, -18, -24] }],
  29: [{ l: 19, s: [-15, -18, 24] }],
  30: [
    { l: 3, s: [10, -13] },
    { l: 6, s: [-13, -19, 24] },
    { l: 31, s: [-13, -19, 24] },
  ],
  31: [],
  32: [],
};

/**
 * Furniture item placements for each room.
 *
 * kind: Type of furniture
 * l: Left coordinate (0-39, horizontal position)
 * b: Bottom coordinate (0-24, vertical position from bottom)
 */
export const roomFurnitureItems = {
  1: [
    { kind: "tapeDrive", l: 23, b: 8 },
    { kind: "tapeDrive", l: 26, b: 8 },
    { kind: "tapeDrive", l: 29, b: 8 },
    { kind: "computer", l: 32, b: 8 },
    { kind: "desk", l: 23, b: 14 },
    { kind: "typewriter", l: 31, b: 14 },
  ],
  2: [
    { kind: "typewriter", l: 2, b: 11 },
    { kind: "typewriter", l: 34, b: 23 },
  ],
  3: [
    { kind: "cupboard", l: 32, b: 5 },
    { kind: "fridge", l: 34, b: 11 },
    { kind: "desk", l: 32, b: 17 },
  ],
  4: [],
  5: [
    { kind: "desk", l: 14, b: 11 },
    { kind: "candy", l: 22, b: 11 },
  ],
  6: [
    { kind: "chest", l: 4, b: 17 },
    { kind: "bin", l: 30, b: 17 },
    { kind: "basin", l: 31, b: 17 },
    { kind: "bath", l: 1, b: 23 },
    { kind: "bin", l: 35, b: 23 },
    { kind: "toilet", l: 36, b: 23 },
  ],
  7: [
    { kind: "loudspeaker", l: 8, b: 5 },
    { kind: "stereoSystem", l: 13, b: 5 },
    { kind: "sofa", l: 19, b: 11 },
    { kind: "lamp", l: 25, b: 11 },
    { kind: "loudspeaker", l: 37, b: 11 },
  ],
  8: [
    { kind: "desk", l: 5, b: 11 },
    { kind: "typewriter", l: 13, b: 11 },
    { kind: "tapeDrive", l: 35, b: 17 },
    { kind: "jukebox", l: 2, b: 23 },
    { kind: "piano", l: 26, b: 23 },
  ],
  9: [
    { kind: "loudspeaker", l: 2, b: 5 },
    { kind: "stereoSystem", l: 9, b: 5 },
    { kind: "loudspeaker", l: 17, b: 5 },
    { kind: "bookcase", l: 35, b: 11 },
    { kind: "bookcase", l: 6, b: 17 },
    { kind: "desk", l: 30, b: 23 },
  ],
  10: [
    { kind: "tapeDrive", l: 7, b: 11 },
    { kind: "typewriter", l: 31, b: 11 },
    { kind: "piano", l: 7, b: 17 },
    { kind: "desk", l: 9, b: 23 },
  ],
  11: [
    { kind: "cupboard", l: 6, b: 5 },
    { kind: "fridge", l: 13, b: 5 },
    { kind: "candy", l: 24, b: 5 },
  ],
  12: [
    { kind: "desk", l: 17, b: 5 },
    { kind: "computer", l: 25, b: 5 },
    { kind: "piano", l: 5, b: 11 },
    { kind: "jukebox", l: 30, b: 11 },
    { kind: "tapeDrive", l: 14, b: 17 },
    { kind: "tapeDrive", l: 17, b: 17 },
    { kind: "candy", l: 19, b: 23 },
  ],
  13: [
    { kind: "bed", l: 28, b: 11 },
    { kind: "chest", l: 6, b: 17 },
    { kind: "candy", l: 2, b: 23 },
  ],
  14: [
    { kind: "typewriter", l: 2, b: 5 },
    { kind: "tapeDrive", l: 30, b: 5 },
    { kind: "piano", l: 15, b: 8 },
  ],
  15: [
    { kind: "piano", l: 19, b: 11 },
    { kind: "computer", l: 25, b: 11 },
    { kind: "typewriter", l: 16, b: 17 },
    { kind: "jukebox", l: 30, b: 17 },
    { kind: "jukebox", l: 33, b: 17 },
  ],
  16: [
    { kind: "bed", l: 27, b: 3 },
    { kind: "chest", l: 30, b: 13 },
    { kind: "fireplace", l: 21, b: 18 },
  ],
  17: [
    { kind: "bookcase", l: 26, b: 11 },
    { kind: "bookcase", l: 17, b: 17 },
    { kind: "chairWithLamp", l: 22, b: 17 },
    { kind: "bookcase", l: 11, b: 23 },
  ],
  18: [
    { kind: "bath", l: 1, b: 23 },
    { kind: "basin", l: 17, b: 23 },
    { kind: "bin", l: 21, b: 23 },
    { kind: "toilet", l: 36, b: 23 },
  ],
  19: [
    { kind: "jukebox", l: 5, b: 3 },
    { kind: "tapeDrive", l: 36, b: 5 },
    { kind: "piano", l: 30, b: 11 },
    { kind: "desk", l: 26, b: 23 },
  ],
  20: [
    { kind: "bed", l: 8, b: 11 },
    { kind: "chest", l: 10, b: 17 },
    { kind: "exit", l: 9, b: 23 },
  ],
  21: [
    { kind: "desk", l: 25, b: 17 },
    { kind: "computer", l: 33, b: 17 },
    { kind: "piano", l: 14, b: 23 },
    { kind: "typewriter", l: 20, b: 23 },
    { kind: "typewriter", l: 24, b: 23 },
    { kind: "typewriter", l: 28, b: 23 },
  ],
  22: [
    { kind: "tapeDrive", l: 30, b: 5 },
    { kind: "tapeDrive", l: 30, b: 11 },
    { kind: "tapeDrive", l: 6, b: 12 },
    { kind: "tapeDrive", l: 30, b: 16 },
    { kind: "tapeDrive", l: 6, b: 17 },
  ],
  23: [
    { kind: "sofa", l: 11, b: 23 },
    { kind: "fireplace", l: 18, b: 23 },
    { kind: "chairWithLamp", l: 28, b: 23 },
  ],
  24: [
    { kind: "fireplace", l: 15, b: 5 },
    { kind: "chairWithLamp", l: 25, b: 5 },
  ],
  25: [
    { kind: "chairWithLamp", l: 32, b: 5 },
    { kind: "desk", l: 12, b: 11 },
    { kind: "bookcase", l: 25, b: 11 },
  ],
  26: [
    { kind: "jukebox", l: 2, b: 11 },
    { kind: "jukebox", l: 2, b: 17 },
    { kind: "jukebox", l: 2, b: 23 },
    { kind: "jukebox", l: 13, b: 11 },
    { kind: "jukebox", l: 13, b: 17 },
    { kind: "jukebox", l: 13, b: 23 },
    { kind: "jukebox", l: 25, b: 11 },
    { kind: "jukebox", l: 25, b: 17 },
    { kind: "jukebox", l: 25, b: 23 },
  ],
  27: [
    { kind: "bookcase", l: 3, b: 4 },
    { kind: "chest", l: 19, b: 6 },
    { kind: "bed", l: 30, b: 8 },
    { kind: "lamp", l: 36, b: 8 },
    { kind: "bookcase", l: 29, b: 14 },
  ],
  28: [
    { kind: "tapeDrive", l: 29, b: 20 },
    { kind: "tapeDrive", l: 32, b: 20 },
    { kind: "tapeDrive", l: 35, b: 20 },
    { kind: "typewriter", l: 4, b: 23 },
  ],
  29: [
    { kind: "candy", l: 2, b: 4 },
    { kind: "piano", l: 31, b: 5 },
    { kind: "tapeDrive", l: 28, b: 11 },
    { kind: "tapeDrive", l: 31, b: 11 },
    { kind: "jukebox", l: 34, b: 11 },
    { kind: "desk", l: 25, b: 17 },
    { kind: "computer", l: 32, b: 17 },
  ],
  30: [
    { kind: "desk", l: 10, b: 12 },
    { kind: "bookcase", l: 11, b: 18 },
    { kind: "bookcase", l: 24, b: 18 },
    { kind: "sofa", l: 12, b: 23 },
    { kind: "chairWithLamp", l: 23, b: 23 },
  ],
  31: [],
  32: [],
};

/**
 * Sprite properties and color replacements for each furniture type.
 *
 * x, y: Sprite coordinates in the sprite sheet (in pixels)
 * w, h: Width and height of the sprite (in pixels)
 * s: Search duration, in scan frames — and, because the progress bar
 *    is drawn at this width, in logical pixels too
 * r: Room-specific color replacements, as r[roomId][paletteIndex]
 */
export const furnitureProperties = {
  tapeDrive: {
    x: 0,
    y: 544,
    w: 22,
    h: 28,
    s: 22,
    r: { 12: { 14: 10 }, 19: { 14: 8 }, 22: { 14: 8 }, 29: { 14: 10 } },
  },
  desk: {
    x: 22,
    y: 544,
    w: 56,
    h: 24,
    s: 64,
    r: {
      3: { 1: 7, 14: 12 },
      9: { 1: 15, 14: 9 },
      12: { 14: 10 },
      19: { 14: 8 },
      21: { 14: 15 },
      29: { 14: 10 },
      30: { 1: 13 },
    },
  },
  computer: { x: 78, y: 544, w: 16, h: 22, s: 20, r: {} },
  typewriter: {
    x: 94,
    y: 544,
    w: 24,
    h: 20,
    s: 22,
    r: { 2: { 14: 8 }, 21: { 14: 15 } },
  },
  bin: { x: 94, y: 564, w: 6, h: 7, s: 15, r: { 18: { 8: 14 } } },
  cupboard: { x: 118, y: 544, w: 46, h: 24, s: 62, r: { 11: { 7: 1 } } },
  bed: { x: 116, y: 568, w: 48, h: 11, s: 36, r: { 16: { 9: 2 } } },
  fridge: { x: 164, y: 544, w: 24, h: 32, s: 50, r: { 11: { 7: 1 } } },
  candy: {
    x: 188,
    y: 544,
    w: 32,
    h: 31,
    s: 26,
    r: { 5: { 10: 14 }, 11: { 10: 12 }, 13: { 10: 9 } },
  },
  chest: {
    x: 220,
    y: 544,
    w: 20,
    h: 21,
    s: 47,
    r: { 6: { 9: 10, 1: 8 }, 16: { 1: 15, 9: 2 }, 27: { 1: 15 } },
  },
  basin: { x: 240, y: 544, w: 30, h: 32, s: 36, r: { 18: { 8: 14, 10: 12 } } },
  bath: { x: 270, y: 544, w: 48, h: 32, s: 8, r: { 18: { 8: 14, 10: 12 } } },
  toilet: { x: 318, y: 544, w: 24, h: 16, s: 15, r: { 18: { 8: 14, 10: 12 } } },
  loudspeaker: { x: 318, y: 560, w: 14, h: 16, s: 8, r: {} },
  stereoSystem: { x: 342, y: 544, w: 15, h: 20, s: 15, r: {} },
  sofa: {
    x: 332,
    y: 565,
    w: 42,
    h: 16,
    s: 40,
    r: { 7: { 12: 15 }, 23: { 14: 2 }, 30: { 12: 13 } },
  },
  jukebox: {
    x: 357,
    y: 544,
    w: 16,
    h: 21,
    s: 15,
    r: { 12: { 14: 10 }, 19: { 14: 8 }, 26: { 14: 5, 1: 13 }, 29: { 14: 10 } },
  },
  lamp: { x: 373, y: 544, w: 15, h: 21, s: 8, r: {} },
  piano: {
    x: 388,
    y: 544,
    w: 40,
    h: 30,
    s: 8,
    r: { 12: { 14: 10 }, 19: { 14: 8 }, 21: { 14: 15 }, 29: { 14: 10 } },
  },
  bookcase: {
    x: 428,
    y: 544,
    w: 24,
    h: 37,
    s: 64,
    r: { 17: { 15: 14 }, 25: { 9: 14, 12: 1 }, 30: { 9: 14, 15: 13 } },
  },
  exit: { x: 452, y: 544, w: 44, h: 39, s: 0, r: {} },
  fireplace: { x: 496, y: 544, w: 70, h: 28, s: 55, r: { 16: { 12: 15 } } },
  chairWithLamp: {
    x: 566,
    y: 544,
    w: 22,
    h: 32,
    s: 26,
    r: { 17: { 12: 14 }, 25: { 12: 1 }, 30: { 12: 13 } },
  },
};

/**
 * Terminal definitions for each room.
 *
 * l: Left coordinate (0-39, horizontal position)
 * b: Bottom coordinate (0-24, vertical position from bottom)
 */
export const roomTerminalItems = {
  1: [
    { l: 10, b: 11 },
    { l: 32, b: 23 },
  ],
  2: [
    { l: 32, b: 5 },
    { l: 1, b: 23 },
  ],
  3: [{ l: 34, b: 23 }],
  4: [{ l: 2, b: 5 }],
  5: [
    { l: 33, b: 5 },
    { l: 7, b: 23 },
  ],
  6: [{ l: 3, b: 5 }],
  7: [{ l: 8, b: 23 }],
  8: [
    { l: 25, b: 5 },
    { l: 22, b: 23 },
  ],
  9: [{ l: 5, b: 23 }],
  10: [
    { l: 34, b: 5 },
    { l: 18, b: 23 },
    { l: 29, b: 23 },
  ],
  11: [{ l: 32, b: 23 }],
  12: [
    { l: 10, b: 11 },
    { l: 5, b: 23 },
  ],
  13: [
    { l: 1, b: 5 },
    { l: 35, b: 23 },
  ],
  14: [{ l: 5, b: 23 }],
  15: [
    { l: 14, b: 5 },
    { l: 31, b: 23 },
  ],
  16: [{ l: 6, b: 23 }],
  17: [
    { l: 5, b: 5 },
    { l: 32, b: 23 },
  ],
  18: [{ l: 1, b: 5 }],
  19: [{ l: 7, b: 23 }],
  20: [{ l: 11, b: 5 }],
  21: [
    { l: 5, b: 5 },
    { l: 10, b: 23 },
  ],
  22: [
    { l: 2, b: 5 },
    { l: 35, b: 23 },
  ],
  23: [
    { l: 3, b: 5 },
    { l: 7, b: 23 },
  ],
  24: [{ l: 25, b: 23 }],
  25: [{ l: 6, b: 23 }],
  26: [{ l: 7, b: 5 }],
  27: [{ l: 32, b: 23 }],
  28: [{ l: 35, b: 5 }],
  29: [{ l: 13, b: 23 }],
  30: [
    { l: 2, b: 23 },
    { l: 35, b: 23 },
  ],
  31: [],
  32: [],
};

export const orbEnemies = {
  1: { x: 10, y: 180 },
  3: { x: 15, y: 112 },
  4: { x: 202, y: 171 },
  6: { x: 100, y: -60 },
  13: { x: 288, y: 10 },
  28: { x: 96, y: 90 },
};

export const robotEnemies = {
  1: [{ l: 10, b: 12 }],
  2: [{ l: 19, b: 12 }],
  3: [
    { l: 20, b: 12 },
    { l: 14, b: 18 },
  ],
  4: [{ l: 4, b: 24 }],
  5: [
    { l: 20, b: 6 },
    { l: 18, b: 12 },
    { l: 28, b: 18 },
    { l: 27, b: 24 },
  ],
  6: [],
  7: [
    { l: 14, b: 6 },
    { l: 30, b: 12 },
    { l: 30, b: 18 },
  ],
  8: [
    { l: 28, b: 12 },
    { l: 8, b: 18 },
    { l: 28, b: 18 },
    { l: 8, b: 24 },
  ],
  9: [
    { l: 8, b: 6 },
    { l: 28, b: 12 },
    { l: 17, b: 18 },
    { l: 26, b: 24 },
  ],
  10: [
    { l: 12, b: 12 },
    { l: 32, b: 18 },
    { l: 12, b: 24 },
  ],
  11: [
    { l: 16, b: 6 },
    { l: 10, b: 12 },
    { l: 26, b: 18 },
    { l: 14, b: 24 },
  ],
  12: [
    { l: 10, b: 6 },
    { l: 9, b: 12 },
    { l: 6, b: 18 },
    { l: 18, b: 24 },
  ],
  13: [
    { l: 28, b: 12 },
    { l: 4, b: 18 },
    { l: 10, b: 24 },
  ],
  14: [
    { l: 10, b: 9 },
    { l: 31, b: 12 },
    { l: 18, b: 15 },
    { l: 6, b: 18 },
  ],
  15: [
    { l: 20, b: 12 },
    { l: 20, b: 18 },
    { l: 16, b: 24 },
  ],
  16: [
    { l: 10, b: 6 },
    { l: 31, b: 9 },
    { l: 24, b: 19 },
  ],
  17: [
    { l: 18, b: 6 },
    { l: 28, b: 12 },
    { l: 8, b: 18 },
    { l: 20, b: 24 },
  ],
  18: [
    { l: 2, b: 12 },
    { l: 34, b: 12 },
    { l: 20, b: 18 },
    { l: 16, b: 24 },
  ],
  19: [
    { l: 35, b: 6 },
    { l: 28, b: 18 },
    { l: 32, b: 24 },
  ],
  20: [
    { l: 15, b: 12 },
    { l: 15, b: 18 },
  ],
  21: [
    { l: 32, b: 6 },
    { l: 7, b: 12 },
    { l: 24, b: 18 },
    { l: 16, b: 24 },
  ],
  22: [
    { l: 26, b: 6 },
    { l: 30, b: 12 },
    { l: 6, b: 18 },
    { l: 6, b: 24 },
  ],
  23: [
    { l: 34, b: 6 },
    { l: 26, b: 12 },
    { l: 15, b: 18 },
    { l: 20, b: 24 },
  ],
  24: [
    { l: 12, b: 6 },
    { l: 22, b: 12 },
    { l: 6, b: 18 },
    { l: 30, b: 18 },
  ],
  25: [
    { l: 7, b: 12 },
    { l: 8, b: 18 },
    { l: 30, b: 18 },
  ],
  26: [
    { l: 8, b: 12 },
    { l: 20, b: 18 },
    { l: 8, b: 24 },
    { l: 20, b: 24 },
  ],
  27: [
    { l: 10, b: 5 },
    { l: 20, b: 12 },
    { l: 34, b: 15 },
    { l: 18, b: 18 },
  ],
  28: [
    { l: 28, b: 21 },
    { l: 20, b: 24 },
  ],
  29: [
    { l: 33, b: 6 },
    { l: 32, b: 12 },
    { l: 30, b: 18 },
  ],
  30: [
    { l: 18, b: 8 },
    { l: 18, b: 13 },
    { l: 18, b: 19 },
    { l: 18, b: 24 },
  ],
  31: [],
  32: [],
};
