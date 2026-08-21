/**
 * The scenes the snapshot harness captures.
 *
 * Each scene names the query string that sets the game up and the
 * input to send afterwards. Determinism comes from three places:
 *
 * - ?map=0 forces one of the 11 layouts instead of rolling for it.
 * - ?cheats=timelord freezes the mission clock, which would otherwise
 *   tick a digit every ~37 scan frames and make every capture differ.
 *   airwalk and stayforever keep scripted walking from dying to a gap
 *   or a robot.
 * - Math.random is replaced with a seeded generator before any script
 *   runs, so every rnd() draw — furniture contents, puzzle colors and
 *   flips, robot types — repeats exactly.
 *
 * settleMs is the one number to be careful with. The game opens on the
 * intro speech and hands off to the elevator scene after 6500ms
 * (game.ts scanAnotherVisitor), and input sent before that handoff is
 * simply dropped. Anything meaning to capture the elevator has to wait
 * past it — otherwise several scenes quietly collapse onto the same
 * intro frame and the suite looks like it covers more than it does.
 *
 * It also has to outlast the cheat banner, which shows for 2500ms
 * after a cheat toggles and is drawn over the game.
 *
 * maxDrift is how many pixels a scene is allowed to differ by before
 * the harness calls it a failure, and every value here was measured
 * over repeated runs rather than picked. The elevator scenes settle to
 * a still image, so their budget is nearly nothing. A room does not:
 * robots patrol and the orb drifts, and pausing lands on whichever
 * frame the scripted input happened to reach, which moves them a step
 * or two. Measured drift there was 450-1710px across runs.
 *
 * That makes room-entry a coarse guard. It will catch a wall, floor or
 * furniture sprite drawn from the wrong region, but a single 8x8 tile
 * gone astray is only ~576 canvas pixels and could hide inside the
 * robot drift. Read the reported bounding box before trusting a pass:
 * drift sits on the robots, a real regression usually does not.
 */
const INTRO_HANDOFF_MS = 6500;
const AFTER_INTRO_MS = INTRO_HANDOFF_MS + 1500;

export const scenes = [
  {
    name: "intro-speech",
    query: "?map=0&cheats=timelord",
    // Deliberately inside the handoff: this is the boot scene, the
    // elevator view before the pocket computer is revealed.
    settleMs: 3000,
    maxDrift: 100,
    keys: [],
  },
  {
    name: "elevator-idle",
    query: "?map=0&cheats=timelord",
    settleMs: AFTER_INTRO_MS,
    maxDrift: 200,
    keys: [],
  },
  {
    name: "elevator-descended",
    query: "?map=0&cheats=timelord",
    settleMs: AFTER_INTRO_MS,
    maxDrift: 200,
    // Ride down and let the car come to rest, so the capture lands on
    // a stopped elevator rather than mid-travel.
    keys: [{ hold: "ArrowDown", forMs: 1200, afterMs: 2500 }],
  },
  {
    name: "room-entry",
    query: "?map=0&cheats=timelord,airwalk,stayforever",
    settleMs: AFTER_INTRO_MS,
    maxDrift: 3000,
    // The elevator starts at shaft 1, level 0, at the top of the
    // world. Both rooms flanking that shaft on map 0 — 27 to the left,
    // 25 to the right — carry bottom doors (roomDoors types 3 and 4),
    // so there is nothing to walk into up here. Ride down one stop to
    // the level's lower corridor first, then walk right into room 25.
    keys: [
      { hold: "ArrowDown", forMs: 1200, afterMs: 2500 },
      { hold: "ArrowRight", forMs: 2200, afterMs: 2000 },
    ],
  },
];
