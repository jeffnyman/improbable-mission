import type { ActionType, Animation } from "../types/agent";
import { audio } from "../common/audioManager";
import { graphics } from "../utils/graphics";
import { gameTime } from "../common/gameTime";
import { keyboard } from "../common/keyboardManager";
import { layoutManager } from "../common/layoutManager";
import { elevator } from "./elevator";

class Agent {
  // This refers to the action that the agent is taking.
  private action: ActionType = "stand";

  // The phase of the agent's action refers to the sprite frame.
  // If the agent is standing, this value is 0. The frames for
  // running are 0 to 13. The frames for jumping are 0 to 11.
  private actionPhase = 0;

  // Sprite sheet coordinates for all agent animations. Organized
  // by direction (left/right), then action (stand/run/jump),
  // containing arrays of {x, y} coordinates for each animation
  // frame.
  private animation: Animation;

  // This refers to the direction the agent is looking in.
  // The values are left or right.
  private direction: "left" | "right" = "left";

  // Horizontal collision radius for each of the 14 run and 12 jump
  // animation frames. Each value represents the distance from the
  // center point to the edge of the hitbox, adjusted to match the
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

  getX(): number {
    return this.x;
  }

  scanRoutine() {
    // Only process agent logic on even frames to slow down
    // movement/action speed.
    if (gameTime.getSFC() % 2) return;

    const actionLeft = keyboard.isKeyPressed(keyboard.keys.LEFT);
    const actionRight = keyboard.isKeyPressed(keyboard.keys.RIGHT);
    const actionJump = keyboard.isKeyPressed(keyboard.keys.SHIFT);

    if (this.action === "jump") {
      this.actionPhase++;

      if (this.actionPhase === 12) {
        // This means the jump has finished.

        if (this.direction === "left") {
          audio.request({ name: "jump.left" });
        }

        if (this.direction === "right") {
          audio.request({ name: "jump.right" });
        }

        this.stand();
      }

      if (this.direction === "left") {
        this.x -= this.actionPhase > 9 ? 6 : 7;
      }

      if (this.direction === "right") {
        this.x += this.actionPhase > 9 ? 6 : 7;
      }
    } else {
      // Handle trying to move both directions.
      if (actionLeft && actionRight) {
        this.stand();
      }

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

            if (this.actionPhase === 5 || this.actionPhase === 12) {
              audio.request({ name: "run.left" });
            }

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

            if (this.actionPhase === 5 || this.actionPhase === 12) {
              audio.request({ name: "run.right" });
            }

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
      // Default collision boundaries for standing.
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

    // Implement context-aware collision boundaries that enforce
    // the elevator shaft limits only when there is not a corridor
    // opening at the current position.
    if (
      this.x < this.minX &&
      !layoutManager.hasLeftCorridor(
        elevator.getCurrentPosition().x,
        elevator.getCurrentPosition().y,
        elevator.getCurrentPosition().rooms,
      )
    ) {
      this.x = this.minX;
    }

    if (
      this.x > this.maxX &&
      !layoutManager.hasLeftCorridor(
        elevator.getCurrentPosition().x,
        elevator.getCurrentPosition().y,
        elevator.getCurrentPosition().rooms,
      )
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
