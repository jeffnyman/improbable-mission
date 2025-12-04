import type { ActionType, Animation } from "../utils/types";
import { graphics } from "../utils/graphics";
import { keyboard } from "../utils/keyboard";
import { checkLayout } from "../ui/checkLayout";

export class Agent {
  // The agent can be in various action states. These are:
  // stand, run and jump.
  private action: ActionType = "stand";

  // The phase of the agent's action refers to the sprite frame.
  // If the agent is standing, this value is 0. The frames for
  // running are 0 to 13. The frames for jumping are 0 to 11.
  private actionPhase = 0;

  // The horizontal position is x and the vertical position is y.
  // These are both measured in pixels.
  private x = 140;
  private y = 45;

  // This refers to the direction the agent is looking in.
  // The values are left or right.
  private direction: "left" | "right" = "left";

  // Horizontal collision radius for each of the 14 run animation
  // frames. Each value represents the distance from the center
  // point to the edge of the hitbox, adjusted to match the
  // sprite's visual bounds per frame.
  private runBoundaryAdjustments = [
    11, 12, 9, 7, 9, 17, 14, 12, 12, 9, 7, 9, 17, 12,
  ];
  private jumpBoundaryAdjustments = [8, 8, 10, 11, 12, 12, 12, 7, 0, 2, 8, 5];

  // Dynamic collision boundaries representing the leftmost (minX)
  // and rightmost (maxX) positions the agent can occupy, calculated
  // each frame based on the current action and animation phase.
  private minX = 0;
  private maxX = 0;

  private animation: Animation;

  constructor() {
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
        jump: [
          { x: 0, y: 462 },
          { x: 35, y: 462 },
          { x: 70, y: 462 },
          { x: 105, y: 462 },
          { x: 140, y: 462 },
          { x: 175, y: 462 },
          { x: 210, y: 462 },
          { x: 245, y: 462 },
          { x: 280, y: 462 },
          { x: 315, y: 462 },
          { x: 350, y: 462 },
          { x: 385, y: 462 },
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
        jump: [
          { x: 0, y: 421 },
          { x: 35, y: 421 },
          { x: 70, y: 421 },
          { x: 105, y: 421 },
          { x: 140, y: 421 },
          { x: 175, y: 421 },
          { x: 210, y: 421 },
          { x: 245, y: 421 },
          { x: 280, y: 421 },
          { x: 315, y: 421 },
          { x: 350, y: 421 },
          { x: 385, y: 421 },
        ],
      },
    };
  }

  getX() {
    return this.x;
  }

  scanRoutine(elevator: {
    x: number;
    y: number;
    rooms: Record<number, number[]>;
  }) {
    const actionLeft = keyboard.isKeyPressed(keyboard.keys.LEFT);
    const actionRight = keyboard.isKeyPressed(keyboard.keys.RIGHT);
    const actionJump = keyboard.isKeyPressed(keyboard.keys.SHIFT);

    if (this.action === "jump") {
      this.actionPhase++;

      if (this.actionPhase === 12) {
        // This means the jump has finished.
        this.stand();
      }

      if (this.direction === "left") {
        this.x -= this.actionPhase > 9 ? 6 : 7;
      }

      if (this.direction === "right") {
        this.x += this.actionPhase > 9 ? 6 : 7;
      }
    } else {
      // Not jumping; so either standing or running.

      // Handle moving to the left.
      if (actionLeft && !actionRight) {
        this.direction = "left";

        if (actionJump) {
          keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
          this.action = "jump";
          this.actionPhase = 0;
        } else {
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
      }

      // Handle moving to the right.
      if (actionRight && !actionLeft) {
        this.direction = "right";

        if (actionJump) {
          keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
          this.action = "jump";
          this.actionPhase = 0;
        } else {
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
      }

      // Handle not moving at all.
      if (!actionLeft && !actionRight) {
        this.stand();
      }
    }

    // Handle collisions with the elevator border. If this is not
    // done, the agent can run right through the elevator and into
    // the walls!
    if (this.action === "stand") {
      this.maxX = 142 + 11;
      this.minX = 143 - 11;
    }

    if (this.action === "run") {
      this.maxX = 142 + this.runBoundaryAdjustments[this.actionPhase];
      this.minX = 143 - this.runBoundaryAdjustments[this.actionPhase];
    }

    if (this.action === "jump") {
      this.maxX = 142 + this.jumpBoundaryAdjustments[this.actionPhase];
      this.minX = 143 - this.jumpBoundaryAdjustments[this.actionPhase];
    }

    // These lines implement context-aware collision boundaries
    // that enforce the elevator shaft limits only when there
    // isn't a corridor opening at the current position.
    if (
      this.x < this.minX &&
      !checkLayout.hasLeftCorridor(elevator.x, elevator.y, elevator.rooms)
    ) {
      this.x = this.minX;
    }

    if (
      this.x > this.maxX &&
      !checkLayout.hasRightCorridor(elevator.x, elevator.y, elevator.rooms)
    ) {
      this.x = this.maxX;
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

      const actionFrames = directionAnim[this.action];
      if (!actionFrames || !actionFrames[this.actionPhase]) return;

      const agentImage = actionFrames[this.actionPhase];
      graphics.draw(agentImage.x, agentImage.y, 35, 41, this.x, this.y);
    }

    // Make sure the agent appears behind the elevator border.
    // Left side.
    graphics.draw(708, 55, 6, 50, 136, 39);

    // Right side.
    graphics.draw(750, 55, 6, 50, 178, 39);
  }

  private stand() {
    this.action = "stand";
    this.actionPhase = 0;
  }
}
