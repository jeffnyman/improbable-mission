export type ActionType = "stand";

interface AnimationFrame {
  x: number;
  y: number;
}

interface DirectionAnimation {
  stand: AnimationFrame[];
}

export interface Animation {
  left: DirectionAnimation;
  right: DirectionAnimation;
}
