import type { ActionType, Animation } from "../types/agent";
import { graphics } from "../utils/graphics";
import { keyboard } from "../common/keyboardManager";

class Agent {
  // This refers to the action that the agent is taking.
  private action: ActionType = "stand";

  // The phase of the agent's action refers to the sprite frame.
  // If the agent is standing, this value is 0. The frames for
  // running are 0 to 13.
  private actionPhase = 0;

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
        run: [
          { x: 0, y: 380 },
          { x: 35, y: 380 },
          { x: 70, y: 380 },
          { x: 105, y: 380 },
          { x: 140, y: 380 },
          { x: 175, y: 380 },
          { x: 210, y: 380 },
          { x: 245, y: 380 },
          { x: 280, y: 380 },
          { x: 315, y: 380 },
          { x: 350, y: 380 },
          { x: 385, y: 380 },
          { x: 420, y: 380 },
          { x: 455, y: 380 },
        ],
      },
      right: {
        stand: [{ x: 0, y: 503 }],
        run: [
          { x: 0, y: 339 },
          { x: 35, y: 339 },
          { x: 70, y: 339 },
          { x: 105, y: 339 },
          { x: 140, y: 339 },
          { x: 175, y: 339 },
          { x: 210, y: 339 },
          { x: 245, y: 339 },
          { x: 280, y: 339 },
          { x: 315, y: 339 },
          { x: 350, y: 339 },
          { x: 385, y: 339 },
          { x: 420, y: 339 },
          { x: 455, y: 339 },
        ],
      },
    };
  }

  getX(): number {
    return this.x;
  }

  scanRoutine() {
    const actionLeft = keyboard.isKeyPressed(keyboard.keys.LEFT);
    const actionRight = keyboard.isKeyPressed(keyboard.keys.RIGHT);

    // Handle moving to the left.
    if (actionLeft && !actionRight) {
      this.direction = "left";

      if (this.action !== "run") {
        // This starts the run action.
        this.action = "run";
        this.actionPhase = 0;
        this.x -= 10;
      } else {
        // This continues the running action.
        this.actionPhase++;

        if (this.actionPhase === 14) this.actionPhase = 0;

        this.x -= 5;
      }
    }

    // Handle moving to the right.
    if (actionRight && !actionLeft) {
      this.direction = "right";

      if (this.action !== "run") {
        // This starts the run action.
        this.action = "run";
        this.actionPhase = 0;
        this.x += 10;
      } else {
        // This continues the running action.
        this.actionPhase++;

        if (this.actionPhase === 14) this.actionPhase = 0;

        this.x += 5;
      }
    }

    // Handle not moving at all.
    if (!actionLeft && !actionRight) {
      this.stand();
    }
  }

  animationRoutine() {
    if (this.action === "stand") {
      const directionAnim = this.animation[this.direction];

      if (!directionAnim) return;

      const agentImage = directionAnim["stand"][0];
      graphics.draw(agentImage.x, agentImage.y, 35, 41, this.x, this.y);
    } else {
      // Handle agent running.
      const directionAnim = this.animation[this.direction];

      if (!directionAnim) return;

      const actionFrames = directionAnim["run"];

      if (!actionFrames || !actionFrames[this.actionPhase]) return;

      const agentImage = actionFrames[this.actionPhase];

      graphics.draw(agentImage.x, agentImage.y, 35, 41, this.x, this.y);

      // Make sure the agent apperas behind the elevator border.
      // Left side.
      graphics.draw(708, 55, 6, 50, 136, 39);

      // Right side.
      graphics.draw(750, 55, 6, 50, 178, 39);
    }
  }

  private stand() {
    this.action = "stand";
    this.actionPhase = 0;
  }
}

export const agent: Agent = new Agent();
