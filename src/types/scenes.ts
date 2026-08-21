/**
 * The full scene set from the original game, and the screen the game is
 * currently on. "anotherVisitor" is the speech intro over the elevator
 * view that the game boots into.
 *
 * game.ts dispatches the active scene twice a frame — once in the scan
 * loop for its logic, once in the animation loop for its drawing — so a
 * new scene needs a case added in both switches, not one.
 */
export type SceneName =
  | "anotherVisitor"
  | "elevator"
  | "room"
  | "terminal"
  | "gameOver"
  | "scores"
  | "elvin";
