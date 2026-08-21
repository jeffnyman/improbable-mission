import type { SpriteRegion, SpriteSize } from "../types/sprites";

/**
 * Named rectangles inside public/images/sprites.png.
 *
 * Every one of these used to be four bare numbers at a call site —
 * graphics.draw(756, 16, 8, 24, 128, ...) — which said nothing about
 * what was being drawn and made the repeats invisible. The sheet is
 * 800x600; spriteRegions.spec.ts checks that everything here fits
 * inside it.
 *
 * Not every sprite can live here. Sprites whose position is chosen at
 * runtime — an agent animation frame, a robot's current phase, a
 * randomised zap flicker — only have a fixed *size*, so those are
 * exported at the bottom as sizes and the position stays at the call
 * site.
 */

// ── The elevator shaft ────────────────────────────────────────────

/** The car itself, with the agent drawn inside it. */
export const ELEVATOR_CAR: SpriteRegion = { x: 708, y: 16, w: 48, h: 96 };

/** One link of the ribbed shaft edging, tiled down both sides. */
export const SHAFT_BORDER_SEGMENT: SpriteRegion = {
  x: 756,
  y: 16,
  w: 8,
  h: 24,
};

/**
 * The rock wall flanking the shaft. Drawn four times — two columns by
 * two rows — so it can scroll continuously as the car travels.
 */
export const SHAFT_WALL: SpriteRegion = { x: 320, y: 0, w: 128, h: 200 };

/** Caps closing off the top and bottom of the shaft. */
export const SHAFT_TOP_CAP: SpriteRegion = { x: 708, y: 0, w: 64, h: 8 };
export const SHAFT_BOTTOM_CAP: SpriteRegion = { x: 708, y: 8, w: 64, h: 8 };

/**
 * The shaft edging redrawn over the agent, so he passes behind the
 * frame rather than in front of it.
 */
export const SHAFT_BORDER_OVERLAY_LEFT: SpriteRegion = {
  x: 708,
  y: 55,
  w: 6,
  h: 50,
};
export const SHAFT_BORDER_OVERLAY_RIGHT: SpriteRegion = {
  x: 750,
  y: 55,
  w: 6,
  h: 50,
};

// ── Corridors joining a shaft to a room ───────────────────────────
//
// Three horizontal strips per side. They are separate sprites rather
// than one mirrored pair because the shading differs: the light in a
// corridor comes from the shaft, so the left and right versions are
// lit from opposite ends.

export const CORRIDOR_LEFT_CEILING: SpriteRegion = {
  x: 164,
  y: 280,
  w: 136,
  h: 8,
};
export const CORRIDOR_LEFT_FLOOR_BORDER: SpriteRegion = {
  x: 164,
  y: 288,
  w: 136,
  h: 8,
};
export const CORRIDOR_LEFT_FLOOR: SpriteRegion = {
  x: 164,
  y: 312,
  w: 136,
  h: 8,
};

export const CORRIDOR_RIGHT_CEILING: SpriteRegion = {
  x: 164,
  y: 296,
  w: 136,
  h: 8,
};
export const CORRIDOR_RIGHT_FLOOR_BORDER: SpriteRegion = {
  x: 164,
  y: 304,
  w: 136,
  h: 8,
};
export const CORRIDOR_RIGHT_FLOOR: SpriteRegion = {
  x: 164,
  y: 320,
  w: 136,
  h: 8,
};

// ── Rooms ─────────────────────────────────────────────────────────

/** The vertical wall edging, tiled down each side of a room. */
export const ROOM_WALL_LEFT_SEGMENT: SpriteRegion = {
  x: 344,
  y: 200,
  w: 8,
  h: 8,
};
export const ROOM_WALL_RIGHT_SEGMENT: SpriteRegion = {
  x: 352,
  y: 200,
  w: 8,
  h: 8,
};

/**
 * The two floor tiles a platform alternates between. Which one a run
 * starts on is the platform's `p` field, so that neighbouring runs
 * keep the pattern in step across a gap.
 */
export const PLATFORM_TILE_A: SpriteRegion = { x: 344, y: 208, w: 8, h: 8 };
export const PLATFORM_TILE_B: SpriteRegion = { x: 352, y: 208, w: 8, h: 8 };

/** A lifting platform, one of the ones a lift init resets. */
export const LIFTING_PLATFORM: SpriteRegion = { x: 344, y: 216, w: 24, h: 8 };

// ── The organ code rooms ──────────────────────────────────────────

export const ORGAN_CONSOLE: SpriteRegion = { x: 368, y: 200, w: 48, h: 34 };

/** The console's numpad, alternating to make it blink. */
export const ORGAN_NUMPAD_FRAMES: readonly SpriteRegion[] = [
  { x: 368, y: 234, w: 48, h: 9 },
  { x: 368, y: 243, w: 48, h: 9 },
];

/** The checkerboard surround the tones are played on. */
export const ORGAN_PLAY_FIELD: SpriteRegion = {
  x: 528,
  y: 228,
  w: 272,
  h: 116,
};

/** The glove, as it appears over the checkerboard. */
export const ORGAN_GLOVE: SpriteRegion = { x: 324, y: 280, w: 24, h: 19 };

// ── Security terminals ────────────────────────────────────────────

/** The masked password row on the monitor. */
export const TERMINAL_ASTERISKS: SpriteRegion = {
  x: 300,
  y: 299,
  w: 23,
  h: 7,
};

/** The blank plate a terminal reply is printed over. */
export const TERMINAL_MESSAGE_PANEL: SpriteRegion = {
  x: 300,
  y: 306,
  w: 168,
  h: 23,
};

// ── The pocket computer ───────────────────────────────────────────

/** The whole unit, drawn along the bottom of the elevator screen. */
export const POCKET_COMPUTER_PANEL: SpriteRegion = {
  x: 0,
  y: 200,
  w: 320,
  h: 80,
};

/** Rails bracketing the two-row memory window on the desktop. */
export const MEMORY_RAIL_LEFT: SpriteRegion = { x: 320, y: 200, w: 5, h: 45 };
export const MEMORY_RAIL_RIGHT: SpriteRegion = { x: 325, y: 200, w: 5, h: 45 };

/** The glove, as it appears over the desktop and the phone. */
export const POCKET_COMPUTER_GLOVE: SpriteRegion = {
  x: 300,
  y: 280,
  w: 24,
  h: 19,
};

export const PHONE_BUTTONS: SpriteRegion = { x: 330, y: 200, w: 14, h: 64 };

/** The frame around the map view of the stronghold. */
export const MAP_BORDER: SpriteRegion = { x: 0, y: 280, w: 164, h: 59 };

// ── Search results ────────────────────────────────────────────────
//
// The signs come pre-tinted in three variants, picked by the room's
// background color, so one sign reads legibly whichever room it is
// found in. Room backgrounds are only ever 3, 5 or 7 (see roomColors
// in data/layout.ts); 5 is the fallback.

export const SNOOZE_SIGN_BY_ROOM_BG: Record<number, SpriteRegion> = {
  5: { x: 110, y: 522, w: 48, h: 22 },
  3: { x: 158, y: 522, w: 48, h: 22 },
  7: { x: 206, y: 522, w: 48, h: 22 },
};

export const LIFT_INIT_SIGN_BY_ROOM_BG: Record<number, SpriteRegion> = {
  5: { x: 254, y: 521, w: 28, h: 23 },
  3: { x: 282, y: 521, w: 28, h: 23 },
  7: { x: 310, y: 521, w: 28, h: 23 },
};

export const SIGN_FALLBACK_ROOM_BG = 5;

// ── Elvin's control room and the score board ──────────────────────

/** The backdrop, drawn once with the LED flashes accumulating on it. */
export const ELVIN_CONTROL_ROOM: SpriteRegion = {
  x: 0,
  y: 0,
  w: 320,
  h: 200,
};

/** Elvin's two poses, alternated while he rages. */
export const ELVIN_FRAMES: readonly SpriteRegion[] = [
  { x: 418, y: 200, w: 30, h: 28 },
  { x: 418, y: 228, w: 30, h: 28 },
];

export const SCORE_BOARD_FRAME: SpriteRegion = {
  x: 492,
  y: 344,
  w: 308,
  h: 200,
};

// ── Sizes for sprites positioned at runtime ───────────────────────

/** Every agent animation frame; the frame table supplies x and y. */
export const AGENT_FRAME_SIZE: SpriteSize = { w: 35, h: 41 };

/** A robot body; its phase and turn offset supply x. */
export const ROBOT_FRAME_SIZE: SpriteSize = { w: 14, h: 21 };
export const ROBOT_FRAME_ROW = 579;

/** A zap beam; the flicker below supplies x. */
export const ZAP_BEAM_SIZE: SpriteSize = { w: 48, h: 10 };
export const ZAP_BEAM_ROW = 586;

/**
 * The beam flickers between four sprites, each of which also has a
 * variant 192px further along the sheet, giving eight looks in all.
 * On the frame that actually kills the agent it freezes on one.
 */
export const ZAP_BEAM_FLICKER_X: readonly number[] = [220, 268, 316, 364];
export const ZAP_BEAM_VARIANT_OFFSET = 192;
export const ZAP_BEAM_KILL_X = 412;

/** The sheet itself, for the bounds check in the spec. */
export const SPRITE_SHEET_SIZE: SpriteSize = { w: 800, h: 600 };
