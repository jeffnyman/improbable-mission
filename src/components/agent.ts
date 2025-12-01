import type { ActionType, Animation } from "../utils/types";
import { graphics } from "../utils/graphics";

export class Agent {
  private action: ActionType = "stand";

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
      right: {
        stand: [{ x: 0, y: 503 }],
      },
    };
  }

  animationRoutine() {
    if (this.action === "stand") {
      const directionAnim = this.animation[this.direction];

      if (!directionAnim) return;

      const agentImage = directionAnim["stand"][0];
      graphics.draw(agentImage.x, agentImage.y, 35, 41, this.x, this.y);
    }
  }
}
