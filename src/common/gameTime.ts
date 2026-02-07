/**
 * Centralized game time tracker that maintains both scan frame and
 * animation frame counters. This allows components throughout the game
 * to access the current frame numbers without direct coupling to the
 * Game class.
 */
class GameTime {
  private scanFrameCounter = 0;
  private animationFrameCounter = 0;

  /**
   * Get the current scan frame counter.
   * This represents the number of scan/update cycles that have
   * occurred since game start.
   */
  getSFC() {
    return this.scanFrameCounter;
  }

  /**
   * Get the current animation frame counter.
   * This represents the number of render/draw cycles that have
   * occurred since game start.
   */
  getAFC() {
    return this.animationFrameCounter;
  }

  /**
   * Set the animation frame counter.
   * Called by the main game loop to keep the centralized counter
   * in sync.
   */
  setAFC(counter: number) {
    this.animationFrameCounter = counter;
  }

  /**
   * Set the scan frame counter.
   * Called by the main game loop to keep the centralized counter
   * in sync.
   */
  setSFC(counter: number) {
    this.scanFrameCounter = counter;
  }
}

export const gameTime: GameTime = new GameTime();
