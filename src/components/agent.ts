import { checkLayout } from "../utils/checkLayout";
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

  // This holds the direction that the agent has entered the
  // from from. This can be either left or right. An empty
  // string means the value hasn't been set so no room
  // direction has been set.
  private roomEnterDirection = "";

  // The following are per-frame horizontal collision boundary
  // adjustments. These values are used to calculate dynamic
  // collision boundaries.
  private correctRun = [11, 12, 9, 7, 9, 17, 14, 12, 12, 9, 7, 9, 17, 12];
  private correctJump = [8, 8, 10, 11, 12, 12, 12, 7, 0, 2, 8, 5];

  // This is a vertical offset adjustment applied when drawing
  // the agent sprite. This allows for shifting the agent's
  // rendering position up or down without changing the logical
  // game position.
  private correctY = 0;

  // Collision boundaries calculated each frame based on action and phase
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

  getCurrentPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getCurrentState(): { x: number; y: number; action: string } {
    return { x: this.x, y: this.y, action: this.action };
  }

  setRoomEnterDirection(direction: string) {
    this.roomEnterDirection = direction;
  }

  setStartPosition(roomId: number) {
    if (this.roomEnterDirection === "right") {
      this.x = 4;
      this.direction = "right";
      this.y = checkLayout.hasLeftDoor(roomId) == 1 ? 9 : 153;
    } else {
      this.x = 283;
      this.direction = "left";
      this.y = checkLayout.hasRightDoor(roomId) == 2 ? 9 : 153;
    }

    this.stand();
  }

  scanElevatorScene(
    pocketComputerState: string,
    elevator: { x: number; y: number; mapRooms: Record<string, number[]> },
  ) {
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

    // Handle collisions with the elevator border. If this is not
    // done, the agent can run right through the elevator and into
    // the walls!
    if (this.action === "stand") {
      // Default collision boundaries for standing.
      this.maxX = 142 + 11;
      this.minX = 143 - 11;
    }

    if (this.action === "run") {
      this.maxX = 142 + this.correctRun[this.actionPhase];
      this.minX = 143 - this.correctRun[this.actionPhase];
    }

    if (this.action == "jump") {
      this.maxX = 142 + this.correctJump[this.actionPhase];
      this.minX = 143 - this.correctJump[this.actionPhase];
    }

    // These lines implement context-aware collision boundaries
    // that enforce the elevator shaft limits only when there
    // isn't a corridor opening at the current position.
    if (
      this.x < this.minX &&
      !checkLayout.hasLeftCorridor(elevator.x, elevator.y, elevator.mapRooms)
    ) {
      this.x = this.minX;
    }

    if (
      this.x > this.maxX &&
      !checkLayout.hasRightCorridor(elevator.x, elevator.y, elevator.mapRooms)
    ) {
      this.x = this.maxX;
    }
  }

  scanRoomScene() {
    if (utils.getSFC() % 2) return;

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
      // THIS ELSE MAY NEED TO BE FURTHER CONDITIONED.
      // Unlike the elevator, thera are more actions here.
      // Not jumping; so either standing or running.

      // Handle trying to move both directions.
      if (actionLeft && actionRight) {
        this.stand();
      }

      // Handle moving to the left.
      if (actionLeft && !actionRight) {
        this.direction = "left";

        if (actionFire) {
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
          this.action = "jump";
          this.actionPhase = 0;
        } else {
          if (this.action !== "run") {
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

      // Handle not moving at all?
      // I do this in the elevator. Mirror it here?
    }
  }

  scanRoutine(
    scene: string,
    pocketComputerState: string,
    elevator: { x: number; y: number; mapRooms: Record<string, number[]> },
  ) {
    if (scene === "elevator") {
      this.scanElevatorScene(pocketComputerState, elevator);
    }

    if (scene === "room") {
      this.scanRoomScene();
    }
  }

  animationRoutine(scene: string) {
    if (this.action === "stand") {
      const directionAnim = this.animation[this.direction];
      if (!directionAnim) return;

      const g = directionAnim["stand"][0];
      graphics.draw(g.x, g.y, 35, 41, this.x, this.y + this.correctY);
    } else {
      const currentAction = this.action;
      const currentPhase = this.actionPhase;

      const directionAnim = this.animation[this.direction];
      if (!directionAnim) return;

      const actionFrames = directionAnim[currentAction];
      if (!actionFrames || !actionFrames[currentPhase]) return;

      const g = actionFrames[currentPhase];
      graphics.draw(g.x, g.y, 35, 41, this.x, this.y + this.correctY);
    }

    // Make sure the agent appears behind the elevator border.
    if (scene == "elevator") {
      graphics.draw(708, 55, 6, 50, 136, 39);
      graphics.draw(750, 55, 6, 50, 178, 39);
    }
  }

  stand() {
    this.action = "stand";
    this.actionPhase = 0;
    this.correctY = 0;
  }
}
