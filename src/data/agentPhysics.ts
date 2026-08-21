/**
 * Agent movement physics tables, ported from the original's
 * constants.js (correctRun / correctJump /
 * platformObstacleCheckForJump). Parity-checked against the
 * original by tests/originalParity.spec.ts, which needs a copy of
 * the original alongside this repo and skips itself without one.
 */

// Horizontal collision radius for each of the 14 run and 12 jump
// animation frames. Each value represents the distance from the
// center point to the edge of the hitbox, adjusted to match the
// sprite's visual bounds per frame.
export const runBoundaryAdjustments = [
  11, 12, 9, 7, 9, 17, 14, 12, 12, 9, 7, 9, 17, 12,
];

export const jumpBoundaryAdjustments = [8, 8, 10, 11, 12, 12, 12, 7, 0, 2, 8, 5];

// Maps which jump animation phases should check for platform
// collisions at each level above the agent. The keys are
// levels (1-5), values are arrays of jump phases (0-11) when
// that level should be checked. This creates collision
// detection that follows the agent's jump arc trajectory.
export const platformObstacleCheckForJump: Record<number, number[]> = {
  1: [0, 1, 10],
  2: [0, 1, 2, 10],
  3: [0, 1, 2, 3, 4, 9, 10],
  4: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  5: [4, 5, 6, 7, 8, 9],
};
