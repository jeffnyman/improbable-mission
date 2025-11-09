import { utils } from "../utils/common";
import { graphics } from "../utils/graphics";
import { roomPlatforms } from "../data/layout";
import type { RoomPlatform } from "../utils/types";

export class Robot {
  private roomId: number;
  private left: number;
  private bottom: number;

  // x: horizontal position (in pixels).
  // y: vertical position (in pixels).
  private x: number;
  private y: number;

  // The platform which the droid is moving on.
  // @ts-expect-error - Need to determine how to use this.
  private platform: RoomPlatform | undefined;

  private graphics: Record<number, number> = {
    1: 24,
    2: 54,
    3: 80,
    4: 108,
    5: 94,
    6: 66,
    7: 38,
  };

  // The robots have displayable graphics states. These
  // are 1-3 (left), 4 (front) and 5-7 (right).
  private graphicsPhase = 1;

  constructor(roomId: number, left: number, bottom: number) {
    this.roomId = roomId;
    this.x = left * 8;
    this.y = bottom * 8 - 19;

    // Left is the left coordinate from 0 to 39.
    // Bottom is the bottom coordinate from 0 to 24.
    this.left = left;
    this.bottom = bottom;
  }

  init() {
    // Determine the droid's platform.
    const platforms: RoomPlatform[] = (
      roomPlatforms as Record<number, RoomPlatform[]>
    )[this.roomId];

    if (!platforms) return;

    for (const platform of platforms) {
      if (
        platform.y === this.bottom &&
        platform.x <= this.left &&
        platform.x + platform.l >= this.left
      ) {
        this.platform = platform;
        break;
      }
    }
  }

  animationRoutine() {
    const offset = utils.getAFC() % 10 < 5 ? 98 : 0;

    graphics.draw(
      this.graphics[this.graphicsPhase] + offset,
      579,
      14,
      21,
      this.x,
      this.y,
    );
  }
}
