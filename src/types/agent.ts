// "lift" freezes the agent while riding an inner lift: input and
// physics are suspended and the stand sprite is drawn until the
// lift stops (InnerLift.stop() returns the agent to "stand").
// "search" holds the agent at a furniture item while the search
// progress bar runs down. "organ" hands control to the music
// room's tone game until the player clicks exit.
export type ActionType =
  | "stand"
  | "run"
  | "jump"
  | "fall"
  | "fallDown"
  | "lift"
  | "search"
  | "organ";

interface AnimationFrame {
  x: number;
  y: number;
}

interface DirectionAnimation {
  stand: AnimationFrame[];
  run: AnimationFrame[];
  jump: AnimationFrame[];
  fall: AnimationFrame[];
  fallDown: AnimationFrame[];
  search: AnimationFrame[];
}

export interface Animation {
  left: DirectionAnimation;
  right: DirectionAnimation;
}
