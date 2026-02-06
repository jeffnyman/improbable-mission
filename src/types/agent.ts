export type ActionType = "stand" | "run";

interface AnimationFrame {
  x: number;
  y: number;
}

interface DirectionAnimation {
  stand: AnimationFrame[];
  run: AnimationFrame[];
}

export interface Animation {
  left: DirectionAnimation;
  right: DirectionAnimation;
}
