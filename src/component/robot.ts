import { rnd } from "../utils/common";
import { gameTime } from "../common/gameTime";
import { graphics } from "../utils/graphics";
import { roomPlatforms, robotTypes } from "../data/layout";
import type { RoomPlatform } from "../types/layout";
import type { RobotActionType, RobotType } from "../types/robot";
import { agent } from "./agent";
import { game } from "../game";
import { audio } from "../common/audioManager";
import {
  ROBOT_FRAME_ROW,
  ROBOT_FRAME_SIZE,
  ZAP_BEAM_FLICKER_X,
  ZAP_BEAM_KILL_X,
  ZAP_BEAM_ROW,
  ZAP_BEAM_SIZE,
  ZAP_BEAM_VARIANT_OFFSET,
} from "../data/spriteRegions";

/**
 * A patrolling robot, ported from the original droids.js. Each
 * robot is randomly assigned one of the twelve active behavior
 * types when its room initializes, and re-randomizes speed (but
 * not type) each time the room resets.
 */
export class Robot {
  private roomId: number;
  private left: number;
  private bottom: number;

  // x: horizontal position (in pixels).
  // y: vertical position (in pixels).
  private x: number;
  private y: number;

  // Horizontal position minimum and maximum. These are based
  // on the platform length and position.
  private minX = 0;
  private maxX = 0;

  // The behavior type, randomized in init().
  private type: RobotType = robotTypes[0];

  private originalDirection: "left" | "right";
  private originalLeft: number;
  private direction: "left" | "right";

  // This holds the travelled distance for the current moving
  // action.
  private movingDistance = 0;

  // Frame counter from the start of a zapping action.
  private zappingFrames = 0;

  // Delay counter: while positive, the robot does nothing.
  private skippedScanFrames = 0;

  // Whether this robot's looping zap sound is playing.
  private zapSound: boolean = false;

  // This holds the moving and turning speed for the left and
  // directions (values from 1-3).
  private speed = { left: 1, right: 1 };

  // This refers to the action that the robot is taking.
  private action: RobotActionType = "moving";

  // The platform which the droid is moving on.
  private platform: RoomPlatform | undefined;

  private graphics: Record<number, number> = {
    1: 24,
    2: 54,
    3: 80,
    4: 108,
    5: 94,
    6: 66,
    7: 38,
  };

  // The robots have displayable graphics states. These
  // are 1-3 (left), 4 (front) and 5-7 (right).
  private graphicsPhase = 1;

  constructor(roomId: number, left: number, bottom: number) {
    this.roomId = roomId;

    // Left is the left coordinate from 0 to 39.
    // Bottom is the bottom coordinate from 0 to 24.
    this.left = left;
    this.bottom = bottom;

    this.x = left * 8;
    this.y = bottom * 8 - 19;

    // Holds the original left position of the robot. This is
    // needed because the robots can be reset.
    this.originalLeft = left;

    // Holds the original (random) direction of the robot. This
    // is needed because the robots can be reset.
    this.originalDirection = rnd(2) === 1 ? "left" : "right";
    this.direction = this.originalDirection;
  }

  init() {
    // Determine the droid's platform.
    const platforms: RoomPlatform[] = (
      roomPlatforms as Record<number, RoomPlatform[]>
    )[this.roomId];

    if (!platforms) return;

    for (const platform of platforms) {
      if (
        platform.y === this.bottom &&
        platform.x <= this.left &&
        platform.x + platform.l >= this.left
      ) {
        this.platform = platform;
        break;
      }
    }

    // Set moving limits based on the platform boundaries.
    // If no platform was found, the robot won't be able to move.
    if (!this.platform) return;

    this.minX = this.platform.x * 8;
    this.maxX = this.minX + (this.platform.l - 2) * 8;

    // Assign a random behavior type from the twelve active ones.
    this.type = robotTypes[rnd(robotTypes.length) - 1];
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getAction() {
    return this.action;
  }

  getGraphicsPhase() {
    return this.graphicsPhase;
  }

  reset() {
    this.left = this.originalLeft;
    this.x = this.left * 8;
    this.direction = this.originalDirection;

    this.action = "moving";
    this.graphicsPhase = this.direction === "left" ? 1 : 7;

    this.movingDistance = 0;
    this.zappingFrames = 0;
    this.skippedScanFrames = 0;
    this.zapSound = false;

    // Default speeds by type: the observers and smart hunters are
    // slow and steady; meanderers can differ per direction; the
    // rest pick one random speed for both directions.
    if (
      [
        "Observation only",
        "Simple meandering",
        "Smart patrolling",
        "Smart patrolling zap",
        "Askance patrolling",
        "Left-to-right zapping",
      ].includes(this.type)
    ) {
      this.speed.left = this.speed.right = 1;
    } else if (this.type === "Meandering") {
      this.speed.left = rnd(3);
      this.speed.right = rnd(3);
    } else {
      this.speed.left = this.speed.right = rnd(3);
    }

    if (this.type === "Left-to-right zapping") this.action = "zapping";
    if (this.type === "Platform-edge zapping") this.movingDistance = 1;
  }

  scanRoutine() {
    // Robots do nothing while snoozing, or while the agent is
    // already dying.
    if (game.getSnoozeTime() > 0) return;
    if (agent.getAction() === "fallDown") return;
    if (agent.getDieByZapFrames() > 0) return;

    // Zapping sound handling: a looping zap sound starts when the
    // robot starts zapping and one zap loop is retired when it
    // stops.
    if (this.zapSound === false && this.action === "zapping") {
      this.zapSound = audio.request({ name: `zap${rnd(5)}`, loop: true });
    } else if (this.zapSound !== false && this.action !== "zapping") {
      audio.stopOneZapSound();
      this.zapSound = false;
    }

    // If there is a delay, do nothing.
    if (this.skippedScanFrames > 0) {
      this.skippedScanFrames--;
      return;
    }

    // Turning deceleration. (The precedence here — turnLeft always
    // decelerates, turnRight only below max speed — matches the
    // original exactly.)
    if (
      this.action === "turnLeft" ||
      (this.action === "turnRight" && this.speed[this.direction] < 3)
    ) {
      if (gameTime.getSFC() % (4 - this.speed[this.direction])) return;
    }

    if (this.action === "turnLeft") {
      if (this.graphicsPhase === 7) {
        audio.request({ name: "droid.turn" });
      }

      // Only decrement if not already at minimum (prevents going negative)
      if (this.graphicsPhase > 1) {
        this.graphicsPhase--;
      }

      if (this.graphicsPhase === 1) {
        this.direction = "left";
        this.action = "moving";
        this.movingDistance = 0;
      }
    } else if (this.action === "turnRight") {
      if (this.graphicsPhase === 1) {
        audio.request({ name: "droid.turn" });
      }

      // Only increment if not already at maximum (prevents overflow)
      if (this.graphicsPhase < 7) {
        this.graphicsPhase++;
      }

      if (this.graphicsPhase === 7) {
        this.direction = "right";
        this.action = "moving";
        this.movingDistance = 0;
      }
    }

    // Behaviors, ported one-for-one from the original droids.js.

    if (this.type === "Observation only") {
      // The robot just waits and looks at you.
      if (this.action === "stand" || this.action === "moving") {
        if (this.x + 7 >= agent.getX() + 17 && this.direction !== "left") {
          this.action = "turnLeft";
        } else if (
          this.x + 7 < agent.getX() + 17 &&
          this.direction !== "right"
        ) {
          this.action = "turnRight";
        }
      }
    } else if (this.type === "Simple meandering") {
      // Moves left and right without reaching the platform edges.
      if (this.movingDistance >= 32 && this.graphicsPhase === 1) {
        this.movingDistance = 0;
        this.action = "turnRight";
      } else if (this.movingDistance >= 32 && this.graphicsPhase === 7) {
        this.movingDistance = 0;
        this.action = "turnLeft";
      } else if (this.action === "moving") {
        this.meandering();
      }
    } else if (this.type === "Meandering") {
      // Moves platform edge to platform edge, possibly at
      // different speeds per direction.
      this.meandering();
    } else if (this.type === "Patrolling") {
      // Meanders until it sees you — then it charges at triple
      // speed and won't turn away while you're in sight.
      this.speed.right = this.speed.left = this.iSeeYou() ? 3 : 1;

      if (this.direction === "left") {
        this.x -= this.speed.left;
        if (this.x <= this.minX) {
          this.x = this.minX;
          if (!this.iSeeYou()) this.action = "turnRight";
        }
      } else if (this.direction === "right") {
        this.x += this.speed.right;
        if (this.x >= this.maxX) {
          this.x = this.maxX;
          if (!this.iSeeYou()) this.action = "turnLeft";
        }
      }
    } else if (this.type === "Patrolling zap") {
      // Patrols; on sighting you (or periodically while standing)
      // it stops and zaps.
      if (this.action === "stand") {
        if (!this.iSeeYou()) this.action = "moving";
        this.movingDistance++;
        if (this.movingDistance >= 40) {
          this.movingDistance = 0;
          this.action = "zapping";
        }
      } else if (this.action !== "zapping") {
        this.action = this.iSeeYou() ? "zapping" : "moving";
      }

      if (this.action === "moving") {
        if (this.direction === "left") {
          this.x -= this.speed.left;
          if (this.x <= this.minX) {
            this.x = this.minX;
            this.action = "turnRight";
          }
        } else if (this.direction === "right") {
          this.x += this.speed.right;
          if (this.x >= this.maxX) {
            this.x = this.maxX;
            this.action = "turnLeft";
          }
        }
      } else if (this.action === "zapping") {
        this.zappingFrames++;
        if (this.zappingFrames >= 40) {
          this.zappingFrames = 0;
          this.action = "stand";
        }
      }
    } else if (this.type.indexOf("Smart patrolling") === 0) {
      // Approaches you even without seeing you; never gives up.
      // The zap variant fires from platform edges when it has you
      // in sight.
      if (this.x + 7 - 4 >= agent.getX() + 17 && this.direction !== "left") {
        this.action = "turnLeft";
      } else if (
        this.x + 7 + 4 < agent.getX() + 17 &&
        this.direction !== "right"
      ) {
        this.action = "turnRight";
      }

      if (this.action === "zapping") {
        this.zappingFrames++;
        if (this.zappingFrames >= 40) {
          this.zappingFrames = 0;
          this.movingDistance = 0;
          this.action = "moving";
        }
      } else if (this.action === "moving") {
        if (this.direction === "left") {
          this.x -= this.speed.left;
          this.movingDistance += this.speed.left;
          if (this.x <= this.minX) {
            this.x = this.minX;
            if (this.type === "Smart patrolling zap" && this.iSeeYou()) {
              if (this.movingDistance > 40) this.action = "zapping";
            } else {
              if (agent.getX() > this.x) this.action = "turnRight";
            }
          }
        }
        if (this.direction === "right") {
          this.x += this.speed.right;
          this.movingDistance += this.speed.right;
          if (this.x >= this.maxX) {
            this.x = this.maxX;
            if (this.type === "Smart patrolling zap" && this.iSeeYou()) {
              if (this.movingDistance > 40) this.action = "zapping";
            } else {
              if (agent.getX() < this.x) this.action = "turnLeft";
            }
          }
        }
      }
    } else if (this.type === "Askance patrolling") {
      // Moves slowly but constantly looks over its shoulder; zaps
      // or charges when it spots you.
      if (this.movingDistance >= 16 && this.action === "moving") {
        this.movingDistance = 0;
        if (this.iSeeYou()) {
          this.action = "zapping";
        } else {
          this.action = "lookingBack";
        }
      } else if (this.action === "lookingBackRight") {
        if (this.iSeeYou("right")) {
          this.graphicsPhase = 7;
          this.action = "zapping";
        } else {
          this.action = "turnLeft";
        }
      } else if (this.action === "lookingBackLeft") {
        if (this.iSeeYou("left")) {
          this.graphicsPhase = 1;
          this.action = "zapping";
        } else {
          this.action = "turnRight";
        }
      } else if (this.action === "lookingBack") {
        if (gameTime.getSFC() % 3) return;

        if (this.direction === "left") {
          this.graphicsPhase++;
          if (this.graphicsPhase === 5) {
            this.skippedScanFrames = 18;
            this.action = "lookingBackRight";
          }
        } else if (this.direction === "right") {
          this.graphicsPhase--;
          if (this.graphicsPhase === 3) {
            this.skippedScanFrames = 18;
            this.action = "lookingBackLeft";
          }
        }
      } else if (this.action === "moving") {
        this.meandering();
      } else if (this.action === "zapping") {
        this.zappingFrames++;
        if (this.zappingFrames >= 40) {
          this.zappingFrames = 0;
          if (this.graphicsPhase === 1) this.action = "turnRight";
          if (this.graphicsPhase === 7) this.action = "turnLeft";
        }
      }
    } else if (this.type === "Left-to-right zapping") {
      // Zaps left for a while, right for a while, forever.
      if (this.action === "moving") this.action = "zapping";
      if (this.action === "zapping") {
        this.zappingFrames++;
        if (this.zappingFrames >= 40) {
          this.zappingFrames = 0;
          this.action = this.direction === "left" ? "turnRight" : "turnLeft";
        }
      }
    } else if (
      [
        "Platform-edge zapping",
        "Berserker zapping",
        "Continuous zapping",
      ].includes(this.type)
    ) {
      // Platform-edge: crosses the platform and zaps at each end.
      // Berserker: also zaps periodically while crossing.
      // Continuous: mostly stays put and zaps almost constantly.
      if (this.action === "moving") {
        if (this.movingDistance === 0) {
          this.movingDistance = 1;
          this.action = "zapping";
        } else {
          if (this.type === "Berserker zapping" && this.movingDistance > 48) {
            this.movingDistance = 0;
          } else if (
            this.type === "Continuous zapping" &&
            this.movingDistance > 16
          ) {
            this.movingDistance = 0;
          } else {
            if (this.direction === "left") {
              this.x -= this.speed.left;
              this.movingDistance += this.speed.left;
              if (this.x <= this.minX) {
                this.x = this.minX;
                this.action = "zapping";
              }
            } else if (this.direction === "right") {
              this.x += this.speed.right;
              this.movingDistance += this.speed.right;
              if (this.x >= this.maxX) {
                this.x = this.maxX;
                this.action = "zapping";
              }
            }
          }
        }
      } else if (this.action === "zapping") {
        this.zappingFrames++;
        if (this.zappingFrames >= 40) {
          this.zappingFrames = 0;
          if (this.x === this.minX && this.direction === "left") {
            this.action = "turnRight";
          } else if (this.x === this.maxX && this.direction === "right") {
            this.action = "turnLeft";
          } else {
            this.action = "moving";
          }
        }
      }
    }
  }

  animationRoutine() {
    // The robot lights blink unless the room is effectively
    // paused (snooze, agent dying, or a taunt freeze).
    let offset = gameTime.getAFC() % 10 < 5 ? 98 : 0;

    if (
      game.getSnoozeTime() > 0 ||
      agent.getAction() === "fallDown" ||
      agent.getDieByZapFrames() > 0 ||
      game.getSkipScanFrames() > 0
    ) {
      offset = 0;
    }

    graphics.draw(
      this.graphics[this.graphicsPhase] + offset,
      ROBOT_FRAME_ROW,
      ROBOT_FRAME_SIZE.w,
      ROBOT_FRAME_SIZE.h,
      this.x,
      this.y,
    );

    // Draw the zap beam: it flickers while firing, and freezes
    // solid on the frame that kills the agent.
    if (
      this.action === "zapping" &&
      !game.getSnoozeTime() &&
      agent.getAction() !== "fallDown" &&
      !game.getSkipScanFrames()
    ) {
      const zx = agent.getDieByZapFrames()
        ? ZAP_BEAM_KILL_X
        : ZAP_BEAM_FLICKER_X[rnd(ZAP_BEAM_FLICKER_X.length) - 1] +
          (rnd(2) === 1 ? ZAP_BEAM_VARIANT_OFFSET : 0);

      if (gameTime.getAFC() % 3 || agent.getDieByZapFrames()) {
        graphics.draw(
          zx,
          ZAP_BEAM_ROW,
          ZAP_BEAM_SIZE.w,
          ZAP_BEAM_SIZE.h,
          this.graphicsPhase === 1 ? this.x - 48 : this.x + 14,
          this.y,
        );
      }
    }
  }

  private meandering() {
    if (this.direction === "left") {
      this.x -= this.speed.left;
      this.movingDistance += this.speed.left;

      if (this.x <= this.minX) {
        this.x = this.minX;
        this.action = "turnRight";
      }
    } else if (this.direction === "right") {
      this.x += this.speed.right;
      this.movingDistance += this.speed.right;

      if (this.x >= this.maxX) {
        this.x = this.maxX;
        this.action = "turnLeft";
      }
    }
  }

  /**
   * Decides whether the agent is in this robot's field of vision.
   * (Function name from Predator, as the original notes.)
   */
  private iSeeYou(dir?: "left" | "right") {
    const action = agent.getAction();
    if (action !== "run" && action !== "stand" && action !== "search")
      return false;
    if (agent.getY() + 20 !== this.y) return false;
    if (this.x <= agent.getX() && (this.graphicsPhase === 7 || dir === "right"))
      return true;
    if (this.x >= agent.getX() && (this.graphicsPhase === 1 || dir === "left"))
      return true;
    return false;
  }
}
