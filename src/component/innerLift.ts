import { graphics } from "../utils/graphics";
import { sprites } from "../utils/sprites";
import { keyboard } from "../common/keyboardManager";
import type { Agent } from "./agent";
import { LIFTING_PLATFORM } from "../data/spriteRegions";

// Structural interface for objects the lift can push/pull
// vertically. Using a structural interface instead of the
// importing Orb directly avoids a circular dependency (the
// Orb already imports InnerLift). Since this is the only
// object that can be pushed/pulled like this, the interface
// makes sense in this module.
interface Pushable {
  getX(): number;
  getY(): number;
  setY(y: number): void;
}

/**
 * Manages a vertical lift group that can move between predefined
 * stations.
 *
 * In the original Impossible Mission, rooms contain vertical lift
 * shafts with one or more platforms that travel together between
 * floor levels. This class handles the movement, positioning, and
 * collision detection for these lift groups.
 */
export class InnerLift {
  // Horizontal position in grid coordinates (0-39), representing
  // where the lift shaft is located in the room.
  private left: number;

  // Valid station positions where lifts can stop (in grid units,
  // 0-24). These define the vertical travel range. For example,
  // [10, 20, 30] means the lift can stop at levels 10, 20, or 30.
  private stops: number[] = [];

  // Current Y positions of physical lift platforms (in pixels from
  // top). Each element represents one platform in this lift group.
  // When the liftmoves, all platforms move together. Single-platform
  // lifts have one element, multi-platform lifts have multiple.
  private lifts: number[] = [];

  // Current movement state of the lift group.
  private state: "stationary" | "up" | "down" = "stationary";

  // The station definition passed to init(), kept for reset().
  private initialState: number[] = [];

  constructor(left: number) {
    this.left = left;
  }

  /**
   * Initializes lift platforms and valid stopping positions from
   * room data.
   *
   * The state array uses a special encoding:
   * - Positive values (e.g., 20): Create a physical platform at
   *   this level AND mark it as a valid stop. The platform starts
   *   at position (value * 8) pixels.
   * - Negative values (e.g., -10): Only mark as a valid stop, don't
   *   create a platform. Used to define the travel range for
   *   single-platform lifts.
   *
   * Example: [30, -10] creates one platform starting at level 30
   * that can travel down to level 10.
   * Example: [30, 20, 10] creates three platforms at levels 30,
   * 20, and 10 that all move together.
   */
  init(state: number[]) {
    // Remember the definition so the lift can be reset (e.g. after
    // the agent dies), and clear any previous platforms so init is
    // idempotent.
    this.initialState = state;
    this.stops = [];
    this.lifts = [];
    this.state = "stationary";

    for (const value of state) {
      // All values define valid stops (using absolute value)
      this.stops.push(Math.abs(value));

      // Only positive values create actual platform instances
      if (value > 0) {
        this.lifts.push(value * 8);
      }
    }
  }

  /**
   * Restores the lift group to its starting configuration. Used
   * when the room resets after the agent dies.
   */
  reset() {
    this.init(this.initialState);
  }

  getLeft() {
    return this.left;
  }

  getLifts() {
    return this.lifts;
  }

  getState() {
    return this.state;
  }

  setState(state: "stationary" | "up" | "down") {
    this.state = state;
  }

  /**
   * Updates lift position and moves the agent if they're riding
   * this lift. Called every frame by the game loop. Movement speed
   * is 4 pixels per frame.
   *
   * Boundary checking uses Math.min/Math.max to handle stops in
   * any order:
   * - Going up: stop when reaching the topmost (minimum) stop position
   * - Going down: stop when reaching the bottommost (maximum) stop position
   */
  scanRoutine(agent: Agent, orb: Pushable | null = null) {
    if (this.state === "stationary") return;

    // If the agent is being zapped mid-ride, the lift stops where
    // it is until the death resolves.
    if (agent.getDieByZapFrames() > 0) return;

    if (this.state === "up") {
      // Find the topmost stop position (smallest Y value = highest on screen)
      const topStop = Math.min(...this.stops) * 8;

      // Check if we've reached or passed the top boundary
      if (topStop >= this.lifts[0]) {
        this.stop(agent);
      } else {
        for (let i = 0; i < this.lifts.length; i++) {
          // Pull the orb up if it's resting on top of this platform
          if (
            orb !== null &&
            sprites.collisionDetect(
              orb.getX() + 5,
              orb.getY() + 7,
              14,
              13,
              this.left * 8,
              this.lifts[i],
              24,
              8,
            )
          ) {
            orb.setY(orb.getY() - 4);
          }

          // Move all platforms up by 4 pixels (decrease Y = move up on screen)
          this.lifts[i] -= 4;
        }

        // Move the agent up with the lift
        agent.setY(agent.getY() - 4);

        // Check if we've landed exactly on a station
        if (this.liftsInStation()) {
          this.stop(agent);
        }
      }
    }

    if (this.state === "down") {
      // Find the bottommost stop position (largest Y value = lowest on screen)
      const bottomStop = Math.max(...this.stops) * 8;

      // Check if we've reached or passed the bottom boundary
      if (bottomStop <= this.lifts[this.lifts.length - 1]) {
        this.stop(agent);
      } else {
        for (let i = 0; i < this.lifts.length; i++) {
          // Push the orb down if this platform is approaching from above
          if (
            orb !== null &&
            sprites.collisionDetect(
              orb.getX() + 5,
              orb.getY() - 1,
              14,
              13,
              this.left * 8,
              this.lifts[i],
              24,
              8,
            )
          ) {
            orb.setY(orb.getY() + 4);
          }

          // Move all platforms down by 4 pixels (increase Y = move down on screen)
          this.lifts[i] += 4;
        }

        // Move the agent down with the lift
        agent.setY(agent.getY() + 4);

        // Check if we've landed exactly on a station
        if (this.liftsInStation()) {
          this.stop(agent);
        }
      }
    }
  }

  /**
   * Renders all lift platforms at their current positions.
   * Each platform is drawn as a 24x8 pixel sprite from the
   * sprite sheet.
   */
  animationRoutine() {
    for (const liftPosition of this.lifts) {
      graphics.drawSprite(LIFTING_PLATFORM, this.left * 8, liftPosition);
    }
  }

  /**
   * Checks if the first lift platform is aligned with any valid
   * station. Used to detect when the lift should auto-stop during
   * movement.
   *
   * Note: Only checks lifts[0] because all platforms in the group
   * move together and maintain relative positioning, so checking
   * one is sufficient.
   */
  private liftsInStation() {
    for (const stop of this.stops) {
      if (stop * 8 === this.lifts[0]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Stops the lift movement and prevents further up/down input.
   * Called when the lift reaches a boundary or arrives at a
   * station.
   *
   * The keyboard "hold" state prevents immediate re-activation
   * if the player is still holding the up/down key.
   */
  private stop(agent: Agent) {
    // Latch only keys that are actually pressed, matching the
    // original: a key that is already released (or held) must not
    // be re-latched.
    if (keyboard.isKeyPressed(keyboard.keys.UP)) {
      keyboard.setKeyState(keyboard.keys.UP, "hold");
    }
    if (keyboard.isKeyPressed(keyboard.keys.DOWN)) {
      keyboard.setKeyState(keyboard.keys.DOWN, "hold");
    }

    this.state = "stationary";
    agent.stand();
  }
}
