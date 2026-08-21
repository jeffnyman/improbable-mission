/**
 * The shapes of the layout tables in data/layout.ts, which were
 * ported from the original's constants.js and keep its very terse
 * field names. Those names are the schema for the largest data file
 * in the project, so they are spelled out here as well as above each
 * table.
 *
 * Three coordinate systems are in play, and which one applies depends
 * on the table:
 *
 * - Character cells, the C64's 8x8 text grid. A room is 40 cells
 *   across and 25 down. Multiply by 8 for logical pixels.
 * - Logical pixels, the C64's 320x200 screen. Everything drawn
 *   through utils/graphics.ts is in these.
 * - Sprite sheet pixels, offsets into the single source sprite image.
 *
 * Values named as a color are never a color: they are indices into
 * the 16-entry C64 palette in data/palette.ts, which the player can
 * re-skin at runtime.
 */

/** The two colors that distinguish one elevator shaft from another. */
export interface ElevatorColor {
  /** Shaft background. */
  bg: number;

  /** Shaft border. */
  bo: number;
}

/**
 * A room's palette. Each of the 32 rooms picks its own, which is why
 * the same platform sprite reads differently from room to room.
 */
export interface RoomColor {
  /** Room background. */
  bg: number;

  /** Platform border. */
  pb: number;

  /** Platform background; also the lift pattern and terminal desk. */
  pg: number;

  /** Platform surface, the edge the agent stands on. */
  ps: number;

  /** Lifting platform surface. */
  ls: number;

  /** Robot body. */
  db: number;

  /** Robot tools. */
  dt: number;

  /** The robot's two indicator lights. */
  dl1: number;
  dl2: number;
}

/**
 * How far one elevator shaft can travel in a given map, in levels.
 * Not every shaft reaches the whole stronghold.
 */
export interface ElevatorExtent {
  /** Highest level reachable (0 is the top). */
  top: number;

  /** Lowest level reachable. */
  bottom: number;
}

/** One of the 11 possible stronghold layouts. */
export interface MapLayout {
  /**
   * Room ids by position, row-major as rooms[level][column]: 6 levels
   * of 9 columns. A 0 means there is no room at that position.
   */
  rooms: number[][];

  /** Travel extent of each of the 8 shafts, keyed 1-8. */
  elevators: Record<number, ElevatorExtent>;
}

/**
 * Where a room sits in the stronghold and which shafts its doors open
 * onto. Derived at runtime by utils/roomConnections.ts rather than
 * stored, since it depends on the map in play.
 */
export interface RoomConnection {
  /** Level the room sits on (0 is the top). */
  level: number;

  /** Index of the shaft to the room's left. */
  elevator: number;

  /**
   * The left door, when the room has one. Its shaft is the one the
   * room's own index refers to; position is which end of the shaft
   * the door meets.
   */
  leftDoor?: {
    elevator: number;
    position: "top" | "bottom";
  };

  /** The right door, when the room has one, onto the next shaft over. */
  rightDoor?: {
    elevator: number;
    position: "top" | "bottom";
  };
}

/** A run of floor in a room, built from repeated 8x8 tiles. */
export interface RoomPlatform {
  /** Left edge, in character cells. */
  x: number;

  /** Top edge, in character cells. */
  y: number;

  /** Length, in tiles. */
  l: number;

  /**
   * Which of the two alternating floor tiles the run starts on, 0 or
   * 1. Neighboring platforms use opposite phases so their patterns
   * stay in step across a gap.
   */
  p: number;
}

/** A column of lifting platforms in a room. */
export interface InnerLiftData {
  /** Horizontal position, in character cells (0-39). */
  l: number;

  /**
   * The heights the lift can stop at, in character cells. A negative
   * value marks a station that starts out empty, so the column has a
   * gap in it until a lift is sent there.
   */
  s: number[];
}

/** One piece of searchable furniture placed in a room. */
export interface FurnitureItemData {
  /** Which furniture type; keys into FurnitureProperties. */
  kind: string;

  /** Left edge, in character cells (0-39). */
  l: number;

  /** Bottom edge, in character cells counted up from 0 (0-24). */
  b: number;
}

/** How a furniture type is drawn and how long it takes to search. */
export interface FurnitureProperties {
  /** Sprite sheet position, in sprite sheet pixels. */
  x: number;
  y: number;

  /** Sprite size, in logical pixels. */
  w: number;
  h: number;

  /**
   * Search duration, counted down one per scan frame while the player
   * holds up. It doubles as the width of the shrinking progress bar
   * in logical pixels, which is why the two always finish together.
   */
  s: number;

  /**
   * Per-room color substitutions, as r[roomId][paletteIndex] giving
   * the palette index to use instead. Lets one sprite sit legibly in
   * rooms whose backgrounds would otherwise swallow it.
   */
  r: Record<number, Record<number, number>>;
}

/** A security terminal placed in a room. */
export interface TerminalItemData {
  /** Left edge, in character cells (0-39). */
  l: number;

  /** Bottom edge, in character cells counted up from 0 (0-24). */
  b: number;
}

/**
 * The floating orb's starting point. Unlike every other placement
 * table this one is in logical pixels, and y may be negative to start
 * the orb above the room, drifting in.
 */
export interface OrbEnemyData {
  x: number;
  y: number;
}

/** A robot's starting point, in character cells like the furniture. */
export interface RobotEnemyData {
  /** Left edge (0-39). */
  l: number;

  /** Bottom edge, counted up from 0 (0-24). */
  b: number;
}
