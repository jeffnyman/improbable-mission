import { graphics } from "../utils/graphics";
import { utils } from "../utils/common";
import { keyboard } from "./keyboard";
import { audio } from "./audio";

interface AnimationFrame {
  x: number;
  y: number;
}

type ActionType =
  | "stand"
  | "run"
  | "jump"
  | "search"
  | "fall"
  | "lift"
  | "fallDown"
  | "codeRoom";

interface DirectionAnimations {
  stand: AnimationFrame[];
  run: AnimationFrame[];
  jump: AnimationFrame[];
  search?: AnimationFrame[];
  fall?: AnimationFrame[];
  lift?: AnimationFrame[];
  fallDown?: AnimationFrame[];
  codeRoom?: AnimationFrame[];
}

interface Animation {
  left: DirectionAnimations;
  right: DirectionAnimations;
}

export class Agent {
  // The horizontal position is x and the vertical position is y.
  // These are both measured in pixels.
  private x = 140;
  private y = 45;

  // This refers to the direction the agent is looking in.
  // The values are left or right.
  private direction: "left" | "right" = "left";

  // The agent can be in various action states. These are: stand,
  // run, jump, search, fall, lift, fallDown, and codeRoom. The
  // only difference between "stand" and "lift" is that the agent
  // is on one of the lifting platforms in the latter case.
  private action: ActionType = "stand";

  // The phase of the agent's action refers to the sprite frame.
  // The breakdown is:
  //   jump:0-11
  //   run:0-13
  //   search:0
  //   fall:0
  //   stand:0
  private actionPhase = 0;

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

  scanElevatorScene(pocketComputerState: string) {
    if (utils.getSFC() % 2) return;
    if (pocketComputerState !== "map") return;

    const actionLeft = keyboard.isKeyPressed(keyboard.keys.LEFT);
    const actionRight = keyboard.isKeyPressed(keyboard.keys.RIGHT);
    const actionFire = utils.fire();

    if (this.action === "jump") {
      this.actionPhase++;

      if (this.actionPhase === 12) {
        // This means the jump has finished.
        this.stand();

        if (this.direction === "left") {
          audio.request({ name: "jumpLeft" });
        }

        if (this.direction === "right") {
          audio.request({ name: "jumpRight" });
        }
      }

      if (this.direction === "left") {
        this.x -= this.actionPhase > 9 ? 6 : 7;
      }

      if (this.direction === "right") {
        this.x += this.actionPhase > 9 ? 6 : 7;
      }
    } else {
      // Not jumping; so either standing or running.

      // Handle trying to move both directions.
      if (actionLeft && actionRight) {
        this.stand();
      }

      // Handle moving to the left.
      if (actionLeft && !actionRight) {
        this.direction = "left";

        if (actionFire) {
          utils.holdFire();
          this.action = "jump";
          this.actionPhase = 0;
        } else {
          if (this.action !== "run") {
            // This starts the run action.
            this.action = "run";
            this.actionPhase = 0;
            this.x -= 10;
          } else {
            // This continues the run action.
            this.actionPhase++;

            if (this.actionPhase === 14) this.actionPhase = 0;

            if (this.actionPhase === 5 || this.actionPhase === 12) {
              audio.request({ name: "stepLeft" });
            }

            this.x -= 5;
          }
        }
      }

      // Handle moving to the right.
      if (actionRight && !actionLeft) {
        this.direction = "right";

        if (actionFire) {
          utils.holdFire();
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

            if (this.actionPhase == 14) this.actionPhase = 0;

            if (this.actionPhase === 5 || this.actionPhase === 12) {
              audio.request({ name: "stepRight" });
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
  }

  scanRoutine(scene: string, pocketComputerState: string) {
    if (scene === "elevator") {
      this.scanElevatorScene(pocketComputerState);
    }
  }

  animationRoutine() {
    if (this.action === "stand") {
      const directionAnim = this.animation[this.direction];
      if (!directionAnim) return;

      const g = directionAnim["stand"][0];
      graphics.draw(g.x, g.y, 35, 41, this.x, this.y);
    } else {
      const currentAction = this.action;
      const currentPhase = this.actionPhase;

      const directionAnim = this.animation[this.direction];
      if (!directionAnim) return;

      const actionFrames = directionAnim[currentAction];
      if (!actionFrames || !actionFrames[currentPhase]) return;

      const g = actionFrames[currentPhase];
      graphics.draw(g.x, g.y, 35, 41, this.x, this.y);
    }
  }

  stand() {
    this.action = "stand";
    this.actionPhase = 0;
  }
}
