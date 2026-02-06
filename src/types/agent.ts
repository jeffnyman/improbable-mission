export type ActionType = "stand" | "run" | "jump";

interface AnimationFrame {
  x: number;
  y: number;
}

interface DirectionAnimation {
  stand: AnimationFrame[];
  run: AnimationFrame[];
  jump: AnimationFrame[];
}

export interface Animation {
  left: DirectionAnimation;
  right: DirectionAnimation;
}
