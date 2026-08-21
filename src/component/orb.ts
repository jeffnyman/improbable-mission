import { game } from "../game";
import { graphics } from "../utils/graphics";
import { options } from "../utils/options";
import { sprites } from "../utils/sprites";
import { gameTime } from "../common/gameTime";
import { orbEnemies, roomColors, roomPlatforms } from "../data/layout";
import { getActualPalette, getColorIndex } from "../utils/paletteUtils";
import type { OrbEnemyData, RoomColor } from "../types/layout";
import type { InnerLift } from "./innerLift";
import type { Agent } from "./agent";
import type { Robot } from "./robot";

export class Orb {
  private roomId: number;
  private x: number;
  private y: number;
  private spriteSheet = sprites.getSpriteSheet();
  private paletteName = options.getPaletteOption();

  // Holds the possible status states of the orb. It can be moving
  // or it can be destroyed by colliding with a robot.
  private status: "moving" | "destroyed";

  // Colored imageData for drawing the furniture.
  private imageData: HTMLImageElement | null = null;

  // Movement state for the special room 28 orb, which sweeps an
  // infinity-sign path instead of pursuing the agent.
  private step = 0;

  constructor(roomId: number) {
    this.roomId = roomId;
    this.x = -1;
    this.y = -1;
    this.status = "moving";
  }

  init() {
    const orbData = (orbEnemies as Record<number, OrbEnemyData>)[this.roomId];

    this.x = orbData.x;
    this.y = orbData.y;

    this.generateImage();
  }

  getStatus() {
    return this.status;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setY(y: number) {
    this.y = y;
  }

  reset() {
    const orbData = (orbEnemies as Record<number, OrbEnemyData>)[this.roomId];

    this.x = orbData.x;
    this.y = orbData.y;

    this.status = "moving";
    this.step = 0;
  }

  /**
   * Updates orb position and behavior each frame.
   *
   * The orb pursues the agent by moving toward their center point,
   * respecting collision boundaries. Movement is throttled to every
   * 3rd frame for balanced difficulty.
   *
   * Behavior phases:
   * 1. Robot collision: Freeze if touching any robot enemy
   * 2. Collision detection: Check all obstacles (platforms, lifts, borders)
   * 3. Vertical wrapping: Respawn at top if pushed off bottom
   * 4. Movement calculation: Move toward agent's center if path is clear
   */
  scanRoutine(
    liftGroups: InnerLift[] = [],
    agent: Agent,
    robotEnemies: Robot[] = [],
  ) {
    if (this.status === "destroyed") return;

    // The orb freezes during snooze time and while the agent is
    // already dying.
    if (game.getSnoozeTime() > 0) return;
    if (agent.getAction() === "fallDown") return;
    if (agent.getDieByZapFrames() > 0) return;

    // Room 28 hosts a special orb that ignores the agent entirely
    // and sweeps an infinity-sign path.
    if (this.roomId === 28) {
      const offsetX = Math.sin(this.step * (Math.PI / 180));
      const offsetY = -Math.sin(this.step * 2 * (Math.PI / 180));

      this.x = 148 + offsetX * 105;
      this.y = 67 + offsetY * 20;

      this.step += 5;
      if (this.step > 359) this.step = this.step - 360;

      return;
    }

    // Phase 1: Robot interaction check
    // If the orb is touching any robot, freeze movement for this
    // frame. This prevents the orb from pushing through robots and
    // adds strategic gameplay (robots can block orbs).
    for (const robot of robotEnemies) {
      if (
        sprites.collisionDetect(
          this.x + 2,
          this.y + 2,
          20,
          15,
          robot.getX(),
          robot.getY(),
          14,
          21,
        )
      ) {
        this.status = "destroyed";
        return;
      }
    }

    // Define the orb's collision detection area (slightly inset
    // from the full 24x19 sprite to allow for visual overlap
    // without triggering collisions).
    const orbArea = { x: this.x + 5, y: this.y + 2, w: 14, h: 14 };

    // Phase 2: Directional collision detection
    // Track which directions are blocked by obstacles. The orb will
    // only move in directions where collision is false.
    const collision = { top: false, bottom: false, left: false, right: false };

    // Check collisions with static platforms
    const platforms = (
      roomPlatforms as Record<
        number,
        { x: number; y: number; l: number; p: number }[]
      >
    )[this.roomId];

    for (const p of platforms) {
      const platformArea = { x: p.x * 8, y: p.y * 8, w: p.l * 8, h: 8 };
      const c = this.collisionDirections(
        orbArea.x,
        orbArea.y,
        orbArea.w,
        orbArea.h,
        platformArea.x,
        platformArea.y,
        platformArea.w,
        platformArea.h,
      );

      if (c.top) collision.top = true;
      if (c.bottom) collision.bottom = true;
      if (c.left) collision.left = true;
      if (c.right) collision.right = true;
    }

    // Check collisions with moving lifts (using live positions)
    for (const g of liftGroups) {
      for (const l of g.getLifts()) {
        const liftArea = { x: g.getLeft() * 8, y: l, w: 24, h: 8 };
        const c = this.collisionDirections(
          orbArea.x,
          orbArea.y,
          orbArea.w,
          orbArea.h,
          liftArea.x,
          liftArea.y,
          liftArea.w,
          liftArea.h,
        );

        if (c.top) collision.top = true;
        if (c.bottom) collision.bottom = true;
        if (c.left) collision.left = true;
        if (c.right) collision.right = true;
      }
    }

    // Check collisions with room borders (8px border on each side)
    if (this.x - 1 < 8) collision.left = true;
    if (this.x + 1 > 288) collision.right = true;

    // Phase 3: Vertical wrapping
    // If the orb falls off the bottom of the screen, respawn it
    // at the top. This creates an endless falling behavior and
    // prevents the orb from disappearing.
    if (this.y >= 198) this.y = -50;

    // Phase 4: Movement throttling
    // Only move on frames where getSFC() % 3 !== 0 (2 out of every
    // 3 frames). This slows the orb's movement to 2/3 speed for
    // balanced difficulty.
    if (gameTime.getSFC() % 3 === 0) return;

    // Phase 5: Calculate pursuit movement
    // Move toward the agent's center point, one pixel at a time
    // in each axis, only in directions that are not blocked by
    // collisions.
    const agentXCenter = agent.getX() + 17;
    const agentYCenter = agent.getY() + 20;
    const orbXCenter = this.x + 12;
    const orbYCenter = this.y + 10;

    // Horizontal movement: move toward agent's X center
    if (agentXCenter < orbXCenter && !collision.left) this.x -= 1;
    else if (agentXCenter > orbXCenter && !collision.right) this.x += 1;

    // Vertical movement: move toward agent's Y center
    if (agentYCenter < orbYCenter && !collision.top) this.y -= 1;
    else if (agentYCenter > orbYCenter && !collision.bottom) this.y += 1;
  }

  animationRoutine() {
    if (this.status === "destroyed") return;
    if (!this.imageData) return;

    graphics.drawImage(
      this.imageData,
      0,
      0,
      24,
      19,
      this.x * 3,
      this.y * 3,
      24 * 3,
      19 * 3,
    );
  }

  private collisionDirections(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number,
  ) {
    return {
      top: sprites.collisionDetect(x1, y1 - 1, w1, h1, x2, y2, w2, h2),
      bottom: sprites.collisionDetect(x1, y1 + 1, w1, h1, x2, y2, w2, h2),
      left: sprites.collisionDetect(x1 - 1, y1, w1, h1, x2, y2, w2, h2),
      right: sprites.collisionDetect(x1 + 1, y1, w1, h1, x2, y2, w2, h2),
    };
  }

  private generateImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 19;

    const context = graphics.getRenderingContext2D(canvas);
    context.drawImage(this.spriteSheet, 0, 581, 24, 19, 0, 0, 24, 19);

    const baseSpriteData = context.getImageData(0, 0, 24, 19);
    const baseSpritePixels = baseSpriteData.data;
    const newImageData = context.createImageData(24, 19);
    const rcp = getActualPalette(this.paletteName);
    const roomColor = (roomColors as Record<number, RoomColor>)[this.roomId];

    for (let i = 0, n = baseSpritePixels.length; i < n; i += 4) {
      const colorIndex = getColorIndex(
        baseSpritePixels[i],
        baseSpritePixels[i + 1],
        baseSpritePixels[i + 2],
      );

      if (colorIndex === false) {
        // Color not found in palette, copy original pixel
        newImageData.data[i] = baseSpritePixels[i];
        newImageData.data[i + 1] = baseSpritePixels[i + 1];
        newImageData.data[i + 2] = baseSpritePixels[i + 2];
        newImageData.data[i + 3] = baseSpritePixels[i + 3];
        continue;
      }

      // The orb's body takes the room's "droid background" color,
      // matching the original's recoloring.
      const rc = colorIndex === 1 ? rcp[roomColor.db] : rcp[colorIndex];

      newImageData.data[i] = parseInt(rc[0] + rc[1], 16);
      newImageData.data[i + 1] = parseInt(rc[2] + rc[3], 16);
      newImageData.data[i + 2] = parseInt(rc[4] + rc[5], 16);
      newImageData.data[i + 3] = baseSpritePixels[i + 3];
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 24;
    tmpCanvas.height = 19;

    const tmpContext = graphics.getRenderingContext2D(tmpCanvas);
    tmpContext.putImageData(newImageData, 0, 0);

    this.imageData = new Image();
    this.imageData.src = tmpCanvas.toDataURL("image/png");
  }
}
