/**
 * The game's two clocks, in frames.
 *
 * The engine deliberately runs simulation and rendering on separate
 * loops (see engine.ts), so there are two counters rather than one:
 *
 * - The scan frame counter (SFC) advances once per logic update, on a
 *   fixed 27ms setInterval. Because the interval is fixed, this
 *   counter is the game's real measure of time: 37 of them come to
 *   999ms, which is where the mission clock's "tick a second every 37
 *   frames" comes from. Robots move on it, searches count down on it.
 * - The animation frame counter (AFC) advances once per render, driven
 *   by requestAnimationFrame throttled to ~30ms. Rendering is allowed
 *   to slip when the browser is busy, so this counter only drives how
 *   things *look* — sprite cycling, blinking, flashing.
 *
 * Putting a behavior on the wrong counter is the bug this split
 * invites: anything on the AFC will run faster or slower depending on
 * the machine, which is fine for a blink and wrong for a robot.
 *
 * Game owns both counters and pushes them here each frame. This exists
 * so components can read the current frame without importing Game,
 * which they cannot do anyway — Game imports most of them.
 *
 * The SFC/AFC names come from the original.
 */
class GameTime {
  private scanFrameCounter = 0;
  private animationFrameCounter = 0;

  getSFC() {
    return this.scanFrameCounter;
  }

  getAFC() {
    return this.animationFrameCounter;
  }

  setAFC(counter: number) {
    this.animationFrameCounter = counter;
  }

  setSFC(counter: number) {
    this.scanFrameCounter = counter;
  }
}

export const gameTime: GameTime = new GameTime();
