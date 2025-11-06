import { graphics } from "../utils/graphics";
import { utils } from "../utils/common";

interface AnimationFrame {
  x: number;
  y: number;
}

interface DirectionAnimations {
  stand: AnimationFrame[];
  run?: AnimationFrame[];
  jump?: AnimationFrame[];
}

interface Animation {
  left: DirectionAnimations;
  right?: DirectionAnimations;
}

export class Agent {
  // The horizontal position is x and the vertical position is y.
  // These are both measured in pixels.
  private x = 140;
  private y = 45;

  // This refers to the direction the agent is looking in.
  // The values are left or right.
  private direction: "left" | "right" = "left";

  private animation: Animation;

  constructor() {
    this.animation = {
      left: {
        stand: [{ x: 35, y: 503 }],
      },
    };
  }

  scanElevatorScene(pocketComputerState: string) {
    if (utils.getSFC() % 2) return;
    if (pocketComputerState !== "map") return;

    // NEXT UP: Add logic for moving the agent.
  }

  scanRoutine(scene: string, pocketComputerState: string) {
    if (scene === "elevator") {
      this.scanElevatorScene(pocketComputerState);
    }
  }

  animationRoutine() {
    // tricky because of the animation frames
    // going to need his direction
    const directionAnim = this.animation[this.direction];
    if (!directionAnim) return;

    const g = directionAnim["stand"][0];
    graphics.draw(g.x, g.y, 35, 41, this.x, this.y);
  }
}
