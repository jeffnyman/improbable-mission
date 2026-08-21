/** Width and height in sprite sheet pixels. */
export interface SpriteSize {
  w: number;
  h: number;
}

/**
 * A rectangle inside the sprite sheet: where a sprite starts and how
 * big it is, all in sprite sheet pixels. Where it lands on screen is
 * the caller's business, and is in logical pixels — see utils/graphics.
 */
export interface SpriteRegion extends SpriteSize {
  x: number;
  y: number;
}
