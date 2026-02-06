import type { ActionType, Animation } from "../types/agent";
import { graphics } from "../utils/graphics";

class Agent {
  // This refers to the action that the agent is taking.
  private action: ActionType = "stand";

  private animation: Animation;

  // This refers to the direction the agent is looking in.
  // The values are left or right.
  private direction: "left" | "right" = "left";

  // The horizontal position is x and the vertical position is y.
  private x = 140; // Centered in elevator shaft (128-192)
  private y = 45; // Position within elevator sprite

  constructor() {
    // Animation frame coordinates reference sprite sheet positions.
    // Each action has frames for both left and right directions.
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

export const agent: Agent = new Agent();
