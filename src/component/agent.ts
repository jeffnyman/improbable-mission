import type { ActionType, Animation } from "../types/agent";
import { audio } from "../common/audioManager";
import { graphics } from "../utils/graphics";
import { sprites } from "../utils/sprites";
import { game } from "../game";
import { gameTime } from "../common/gameTime";
import { keyboard } from "../common/keyboardManager";
import { layoutManager } from "../common/layoutManager";
import { sceneManager } from "../common/sceneManager";
import { elevator } from "./elevator";
import { roomPlatforms } from "../data/layout";
import {
  runBoundaryAdjustments,
  jumpBoundaryAdjustments,
  platformObstacleCheckForJump,
} from "../data/agentPhysics";
import { getColorIndex } from "../utils/paletteUtils";
import { rnd } from "../utils/common";
import { cheats } from "../common/cheats";
import { passwords, roomColors, furnitureProperties } from "../data/layout";
import { pocketComputer } from "./pocketComputer";
import type { Furniture } from "./furniture";
import type { InnerLift } from "./innerLift";
import type { Orb } from "./orb";
import type { Robot } from "./robot";
import {
  AGENT_FRAME_SIZE,
  LIFT_INIT_SIGN_BY_ROOM_BG,
  SHAFT_BORDER_OVERLAY_LEFT,
  SHAFT_BORDER_OVERLAY_RIGHT,
  SIGN_FALLBACK_ROOM_BG,
  SNOOZE_SIGN_BY_ROOM_BG,
} from "../data/spriteRegions";

export class Agent {
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

  // This holds the direction that the agent has entered the room
  // from. This can be either left or right. An empty string means
  // means the value hasn't been set so no room direction has been
  // set.
  private roomEnterDirection = "";

  // Horizontal collision radii per animation frame live in
  // data/agentPhysics.ts, parity-checked against the original.
  private runBoundaryAdjustments = runBoundaryAdjustments;

  private jumpBoundaryAdjustments = jumpBoundaryAdjustments;

  // The horizontal position is x and the vertical position is y.
  private x = 140; // Centered in elevator shaft (128-192)
  private y = 45; // Position within elevator sprite

  // This is a vertical offset adjustment applied when drawing
  // the agent sprite. This allows for shifting the agent's
  // rendering position up or down without changing the logical
  // game position.
  private correctY = 0;

  // Jump-arc collision phase map; see data/agentPhysics.ts.
  private platformObstacleCheckForJump = platformObstacleCheckForJump;

  // The furniture item currently being searched (while the
  // action is "search").
  private searchedFurniture: Furniture | false = false;

  // Frame counter for the zap death: nonzero while the agent is
  // being dissolved by a robot zap or the orb's touch.
  private dieByZapFrames = 0;

  // Screen pixels already dissolved away during the zap death
  // animation, keyed "x,y".
  private dieByZapErase = new Set<string>();

  // When jumping, this holds the level number the agent will
  // land on after the jump completes. False means no platform
  // detected above.
  private newLevelAfterJump: number | false = false;

  // When jumping under a tight platform (low ceiling), this
  // holds the level number where the agent should land. False
  // means no tight platform scenario detected.
  private jumpUnderTightPlatform: number | false = false;

  // Tracks how many frames the agent has been falling. Used to
  // accelerate fall speed: slower drift for first 15 frames,
  // then faster descent.
  private fallDuration = 0;

  // Holds an incrementing value of animation frames that trigger
  // if the agent falls through the floor.
  private deathByFallingFrames = 0;

  private collisionMap!: Record<
    "left" | "right",
    Record<"stand" | "run" | "jump" | "fall" | "search", string[]>
  >;

  constructor() {
    // Animation frame coordinates reference sprite sheet positions.
    // Each action has frames for both left and right directions.
    this.animation = {
      left: {
        stand: [{ x: 35, y: 503 }],
        search: [{ x: 70, y: 503 }],
        fall: [{ x: 175, y: 380 }],
        fallDown: [],
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
        search: [{ x: 70, y: 503 }],
        fall: [{ x: 175, y: 339 }],
        fallDown: [],
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

    this.initializeCollisionMaps();
  }

  /**
   * Builds the per-frame pixel collision masks from the sprite
   * sheet. The constructor runs before the sprite sheet has
   * loaded (producing empty masks), so the game calls this again
   * during init, after sprites are ready — the foot-pixel falling
   * detection depends on real masks.
   */
  initializeCollisionMaps() {
    this.collisionMap = {
      left: {
        stand: [this.getCollisionMap("left", "stand", 0)],
        search: [this.getCollisionMap("left", "search", 0)],
        fall: [this.getCollisionMap("left", "fall", 0)],
        run: Array.from({ length: 14 }, (_, i) =>
          this.getCollisionMap("left", "run", i),
        ),
        jump: Array.from({ length: 12 }, (_, i) =>
          this.getCollisionMap("left", "jump", i),
        ),
      },
      right: {
        stand: [this.getCollisionMap("right", "stand", 0)],
        search: [this.getCollisionMap("right", "search", 0)],
        fall: [this.getCollisionMap("right", "fall", 0)],
        run: Array.from({ length: 14 }, (_, i) =>
          this.getCollisionMap("right", "run", i),
        ),
        jump: Array.from({ length: 12 }, (_, i) =>
          this.getCollisionMap("right", "jump", i),
        ),
      },
    };
  }

  getX(): number {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getAction(): string {
    return this.action;
  }

  getDieByZapFrames(): number {
    return this.dieByZapFrames;
  }

  setRoomEnterDirection(direction: string) {
    this.roomEnterDirection = direction;
  }

  setStartPosition(roomId: number) {
    if (this.roomEnterDirection === "right") {
      this.x = 4;
      this.direction = "right";
      this.y = layoutManager.hasLeftDoor(roomId) == 1 ? 9 : 153;

      // Rooms with no platform at this entrance: keep the agent
      // back in the doorway instead of dropping them oddly.
      if (this.y === 9 && [15, 17].includes(roomId)) this.x = -11;
      if (this.y === 153 && [9, 12, 14, 16, 19, 25].includes(roomId))
        this.x = -11;
    } else {
      this.x = 283;
      this.direction = "left";
      this.y = layoutManager.hasRightDoor(roomId) == 2 ? 9 : 153;

      // Rooms with no platform at this entrance: keep the agent
      // back in the doorway instead of dropping them oddly.
      if (this.y === 9 && [2, 20].includes(roomId)) this.x = 296;
      if (this.y === 153 && [11, 17, 29].includes(roomId)) this.x = 296;
    }

    this.stand();
  }

  setX(x: number) {
    this.x = x;
  }

  setY(y: number) {
    this.y = y;
  }

  setAction(action: "stand") {
    this.action = action;
  }

  setDirection(direction: "left" | "right") {
    this.direction = direction;
  }

  scanElevatorScene() {
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
              audio.request({ name: "step.left" });
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
              audio.request({ name: "step.right" });
            }

            this.x += 5;
          }
        }
      }

      // Handle not moving at all. Fire while standing opens the
      // pocket computer's puzzle screen.
      if (!actionLeft && !actionRight) {
        this.stand();

        if (actionJump) {
          keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
          pocketComputer.setState("puzzles");
          pocketComputer.resetPointer();
          audio.request({ name: "beep2" });
        }
      }
    }

    // Handle collisions with the elevator border. Bounds exist
    // only while running or jumping — a standing agent is never
    // clamped (matching the original, where the bounds stay
    // undefined for other actions).
    let minX: number | undefined;
    let maxX: number | undefined;

    if (this.action === "run") {
      maxX = 142 + this.runBoundaryAdjustments[this.actionPhase];
      minX = 143 - this.runBoundaryAdjustments[this.actionPhase];
    }

    if (this.action === "jump") {
      maxX = 142 + this.jumpBoundaryAdjustments[this.actionPhase];
      minX = 143 - this.jumpBoundaryAdjustments[this.actionPhase];
    }

    // Enforce the elevator shaft limits only when there is not a
    // corridor opening at the current position.
    if (
      minX !== undefined &&
      this.x < minX &&
      !layoutManager.hasLeftCorridor(
        elevator.getCurrentPosition().x,
        elevator.getCurrentPosition().y,
        elevator.getCurrentPosition().rooms,
      )
    ) {
      this.x = minX;
    }

    if (
      maxX !== undefined &&
      this.x > maxX &&
      !layoutManager.hasRightCorridor(
        elevator.getCurrentPosition().x,
        elevator.getCurrentPosition().y,
        elevator.getCurrentPosition().rooms,
      )
    ) {
      this.x = maxX;
    }
  }

  scanRoomScene(onLeaveRoom: (direction: string) => void) {
    // Only process agent logic on even frames to slow down
    // movement/action speed.
    if (gameTime.getSFC() % 2) {
      let skip = true;

      if (this.action === "fall") {
        skip = false;
        // The zap death animation runs at half rate even when the
        // agent was falling.
        if (this.dieByZapFrames > 0) skip = true;
      }

      if (skip) return;
    }

    if (this.action === "fallDown") {
      this.deathByFallingFrames++;

      if (this.deathByFallingFrames === 1) {
        audio.stopAllSounds();
      } else if (this.deathByFallingFrames === 2) {
        audio.request({ name: "falling" });
      } else if (this.deathByFallingFrames >= 70) {
        // The death resolves: the room resets, the agent respawns
        // at the door they entered through, and dying costs ten
        // minutes on the mission clock.
        this.deathByFallingFrames = 0;
        game.getRoom(game.getRoomId())?.resetAfterDie(this);
        game.increaseTime("10m");
      }

      return;
    }

    // Playing the organ: the room's tone game owns all input
    // until the player clicks its exit area.
    if (this.action === "organ") return;

    // The zap death: the agent dissolves for 60 frames, then the
    // room resets, the agent respawns, and ten minutes are lost.
    if (this.dieByZapFrames > 0) {
      this.dieByZapFrames++;

      if (this.dieByZapFrames === 2) {
        audio.stopAllSounds();

        // If the agent died mid-search on an already-searched
        // item, it still vanishes.
        if (
          this.searchedFurniture &&
          this.searchedFurniture.getSearchTime() <= 0 &&
          this.searchedFurniture.getKind() !== "exit"
        ) {
          this.searchedFurniture.setVisible(false);
        }
      } else if (this.dieByZapFrames === 3) {
        audio.request({ name: "die.by.zap" });
      } else if (this.dieByZapFrames >= 60) {
        this.dieByZapFrames = 0;
        this.dieByZapErase.clear();
        game.getRoom(game.getRoomId())?.resetAfterDie(this);
        game.increaseTime("10m");
      }

      return;
    }

    const actionUp = keyboard.isKeyPressed(keyboard.keys.UP);
    const actionDown = keyboard.isKeyPressed(keyboard.keys.DOWN);
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
    } else if (this.action === "fall") {
      // Handle falling: accelerate descent and check for landing
      // on platforms.
      this.fallDuration++;

      if (this.fallDuration < 15) {
        this.x += this.direction === "left" ? -1 : 1;
      } else {
        this.x += this.direction === "left" ? -2 : 2;
      }

      // The landing test is the same foot-pixel falling detection
      // used everywhere else: still falling means keep descending,
      // otherwise the agent has landed.
      if (this.isFalling()) {
        this.y += this.fallDuration < 15 ? 4 : 8;

        if (this.y > 176) {
          this.action = "fallDown";
          return;
        }
      } else {
        this.fallDuration = 0;
        if (this.direction === "left") {
          audio.request({ name: "jump.left" });
        }

        if (this.direction === "right") {
          audio.request({ name: "jump.right" });
        }

        this.stand();
      }
    } else if (this.action === "lift") {
      // Riding an inner lift: the agent is frozen — no input, no
      // physics — until the lift stops (InnerLift.stop() returns
      // them to "stand").
    } else if (this.action === "search") {
      // Searching furniture: the progress bar runs down at
      // two-thirds speed while up is held.
      if (gameTime.getSFC() % 3 === 0) return;

      const furniture = this.searchedFurniture as Furniture;

      if (furniture.getKind() !== "exit") furniture.decrementSearchTime();

      if (furniture.getSearchTime() === 0) {
        // The search completes: deliver the result.
        if (furniture.getContents() === "nothing") {
          // Elvin's door opens only to the full password.
          if (
            furniture.getKind() === "exit" &&
            game.getSolvedPassword() === passwords[game.getMapId()]
          ) {
            game.startElvinScene();
            return;
          }
        }

        if (furniture.getContents() === "snooze") {
          game.incrementPasswordsFound();
          game.setSnoozes(game.getSnoozes() + 1);
        }

        if (furniture.getContents() === "liftReset") {
          game.incrementPasswordsFound();
          game.setLiftInits(game.getLiftInits() + 1);
        }

        if (furniture.getContents() === "puzzle") {
          const piece = furniture.getPuzzle();
          if (piece) pocketComputer.addPuzzle(piece.clone());
        }
      }

      if (actionUp === false) {
        // Search released: a fully searched furniture item
        // vanishes (except Elvin's door).
        if (
          furniture.getSearchTime() <= 0 &&
          furniture.getKind() !== "exit"
        ) {
          furniture.setVisible(false);
        }

        this.stand();
        this.searchedFurniture = false;
      }
    } else if (this.action === "stand" || this.action === "run") {
      // Handle trying to move both directions.
      if (actionLeft && actionRight) {
        this.stand();
      }

      // Handle moving to the left. Fire is deliberately not
      // latched in the room scene (unlike the elevator), so
      // holding fire plus a direction chains jumps back to back.
      if (actionLeft && !actionRight) {
        this.direction = "left";

        if (actionJump) {
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
              audio.request({ name: "step.left" });
            }

            this.x -= 5;
          }
        }
      }

      // Handle moving to the right. Fire is deliberately not
      // latched here either — see the left-movement note.
      if (actionRight && !actionLeft) {
        this.direction = "right";

        if (actionJump) {
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
              audio.request({ name: "step.right" });
            }

            this.x += 5;
          }
        }
      }

      // Handle lift control, furniture searching, and terminals:
      // up/down with no direction rides a lift the agent stands
      // on; otherwise up searches furniture or logs into a
      // terminal.
      if (
        !actionJump &&
        (actionUp || actionDown) &&
        !(actionLeft || actionRight)
      ) {
        const roomId = game.getRoomId();
        const liftGroups = game.getRoom(roomId)?.getLiftGroups() || [];
        const liftGroup = this.standingOnLift(liftGroups);

        if (liftGroup !== false) {
          this.action = "lift";
          liftGroup.setState(actionUp ? "up" : "down");
        } else if (actionUp) {
          const currentRoom = game.getRoom(game.getRoomId());

          if (currentRoom?.getType() === "organ") {
            // The music room: standing at the organ console
            // starts the tone game.
            if (this.x >= 133 && this.x <= 150) {
              currentRoom.resetOrgan();
              this.action = "organ";
              return;
            }
          } else {
            // Search the furniture the agent is standing in front
            // of...
            const furniture = this.standingOnFurniture();

            if (furniture !== false) {
              this.searchedFurniture = furniture;
              this.action = "search";
              this.actionPhase = 0;
            } else {
              // ...or use the terminal there.
              const terminal = this.standingOnTerminal();

              if (terminal !== false) {
                sceneManager.setScene("terminal");
                game.setActualTerminal(terminal);
                terminal.setMenu(3);
                keyboard.setKeyState(keyboard.keys.UP, "hold");
              }
            }
          }
        }
      }

      // Handle not moving at all (guarded so a lift ride or a
      // search started just above survives this frame). A
      // standing jump starts here: fire with no direction jumps
      // in the current facing.
      if (
        this.action !== "lift" &&
        this.action !== "search" &&
        !actionLeft &&
        !actionRight
      ) {
        this.stand();

        if (actionJump) {
          this.action = "jump";
          this.actionPhase = 0;
        }
      }
    }

    // Calculate room boundaries based on agent action and
    // animation frames. Bounds exist only for run, jump, and
    // fall — a standing agent is never border-clamped, matching
    // the original where the bounds stay undefined otherwise.
    let minX: number | undefined;
    let maxX: number | undefined;

    if (this.action === "run") {
      maxX = 277 + this.runBoundaryAdjustments[this.actionPhase];
      minX = 8 - this.runBoundaryAdjustments[this.actionPhase];
    } else if (this.action === "jump") {
      maxX = 277 + this.jumpBoundaryAdjustments[this.actionPhase];
      minX = 8 - this.jumpBoundaryAdjustments[this.actionPhase];
    } else if (this.action === "fall") {
      maxX = 284;
      minX = 2;
    }

    // Handle platform collision.
    let collMinX = -999;
    let collMaxX = 999;

    // Get lift groups for live position checking in collision
    // detection.
    const roomId = game.getRoomId();
    const liftGroups = game.getRoom(roomId)?.getLiftGroups() || [];

    if (this.action === "run" || this.action === "stand") {
      for (let i = 1; i <= 4; i++) {
        // Check for a platform on the level that is in front
        // of the agent. Borders are excluded here: only real
        // platforms and lifts block movement, so doorways and
        // room edges stay open.
        const agentLevel = (this.y + 39) / 8;
        const level = agentLevel - i;
        const px = this.getSafetyPixels(level, roomId, false, liftGroups);

        if (this.direction === "right") {
          for (let j = this.x + 18; j < this.x + 35; j++) {
            if (+px[j] > 0) {
              if (j < collMaxX) collMaxX = j;
            }
          }
        } else if (this.direction === "left") {
          for (let j = this.x + 17; j > this.x; j--) {
            if (+px[j] > 0) {
              if (j > collMinX) collMinX = j;
            }
          }
        }
      }
    }

    // Handle platform collision during the jump arc (when not
    // jumping to a higher platform). Checks different levels
    // based on current jump phase to follow jump trajectory.
    if (this.action === "jump" && !this.newLevelAfterJump) {
      for (let i = 1; i <= 5; i++) {
        if (i === 5 && this.jumpUnderTightPlatform) continue;

        const ph = this.actionPhase;

        if (this.platformObstacleCheckForJump[i].indexOf(ph) === -1) continue;

        // Check for a platform on this level that is in front
        // of the agent. Borders are excluded here too, so the
        // agent can jump out through a doorway.
        const agentLevel = (this.y + 39) / 8;
        const level = agentLevel - i;
        const px = this.getSafetyPixels(level, roomId, false, liftGroups);

        if (this.direction === "right") {
          for (let j = this.x + 18; j < this.x + 35; j++) {
            if (+px[j] > 0) {
              if (j < collMaxX) collMaxX = j;
            }
          }
        } else if (this.direction === "left") {
          for (let j = this.x + 17; j > this.x; j--) {
            if (+px[j] > 0) {
              if (j > collMinX) collMinX = j;
            }
          }
        }
      }
    }

    // Apply the platform side-collision limits. These are only
    // ever set while running, standing, or jumping, so one of
    // the branches below always applies when a limit exists.
    if (collMinX > -999) {
      let mx = -999;

      if (this.action === "run") {
        mx = collMinX - this.runBoundaryAdjustments[this.actionPhase] + 2;
      } else if (this.action === "stand") {
        mx = collMinX - 10;
      } else if (this.action === "jump") {
        mx = collMinX - this.jumpBoundaryAdjustments[this.actionPhase];
      }

      if (this.x < mx) this.x = mx;
    }

    if (collMaxX < 999) {
      let mx = 999;

      if (this.action === "run") {
        mx = collMaxX - 35 + this.runBoundaryAdjustments[this.actionPhase] - 2;
      } else if (this.action === "stand") {
        mx = collMaxX - 35 + 10;
      } else if (this.action === "jump") {
        mx = collMaxX - 35 + this.jumpBoundaryAdjustments[this.actionPhase];
      }

      if (this.x > mx) this.x = mx;
    }

    // Apply room boundary constraints (unless there is a door
    // at the right level).
    if (minX !== undefined && this.x < minX) {
      const leftDoor = layoutManager.hasLeftDoor(game.getRoomId());
      const canExit =
        (leftDoor === 1 && this.y === 9) || (leftDoor === 4 && this.y === 153);

      if (!canExit) {
        this.x = minX;
      }
    }

    if (maxX !== undefined && this.x > maxX) {
      const rightDoor = layoutManager.hasRightDoor(game.getRoomId());
      const canExit =
        (rightDoor === 2 && this.y === 9) ||
        (rightDoor === 3 && this.y === 153);

      if (!canExit) {
        this.x = maxX;
      }
    }

    // Snap agent to platform level when the jump completes.
    if (
      this.action === "jump" &&
      this.actionPhase === 11 &&
      this.newLevelAfterJump
    ) {
      this.y = this.newLevelAfterJump * 8 - 39;
      this.correctY = 0;
      this.newLevelAfterJump = false;
    }


    // Handle landing when jumping under a low ceiling (tight
    // platform). Positions agent five levels below the ceiling
    // platform.
    if (
      this.action === "jump" &&
      this.actionPhase === 11 &&
      this.jumpUnderTightPlatform
    ) {
      this.correctY = 0;
      this.y = (this.jumpUnderTightPlatform + 5) * 8 - 39;
    }

    // Falling detection runs after the snap corrections and
    // before the jump-ascent platform detection, matching the
    // original's evaluation order.
    this.detectFalling();

    // Detect platform above during jump ascent (phases 8-11).
    if (this.action === "jump" && this.actionPhase > 7) {
      let hit = false;
      const agentLevel = (this.y + 39) / 8;

      for (let i = 1; i < 4; i++) {
        // Check for platform on this level under the agent.
        // Borders are excluded so a doorway never registers as a
        // landing platform.
        const level = agentLevel - i;
        const px = this.getSafetyPixels(level, roomId, false, liftGroups);

        for (let j = this.x + 11; j <= this.x + 24; j++) {
          if (+px[j] > 0) {
            this.newLevelAfterJump = level;
            hit = true;
            break;
          }
        }
      }

      if (!hit && this.newLevelAfterJump) {
        this.newLevelAfterJump = false;
        this.correctY = 0;
      }

      if (this.newLevelAfterJump) {
        this.jumpUnderTightPlatform = false;
        const correct = [23, 16, 4];

        if (correct[this.actionPhase - 8]) {
          this.correctY =
            -(agentLevel - this.newLevelAfterJump) * 8 +
            correct[this.actionPhase - 8];
        }
      }
    }

    // Detect when agent hits head on low ceiling during a jump
    // (jamming). Only checked during mid-jump (phases 4-9) when
    // not jumping to a higher platform.
    if (
      this.action === "jump" &&
      !this.newLevelAfterJump &&
      this.actionPhase > 3 &&
      this.actionPhase < 10
    ) {
      // Check for platform five levels above (where the agent's
      // head would hit). Borders excluded — walls are not
      // ceilings.
      const agentLevel = (this.y + 39) / 8;
      const level = agentLevel - 5;
      const px = this.getSafetyPixels(level, roomId, false, liftGroups);

      for (let j = this.x + 10; j <= this.x + 24; j++) {
        if (+px[j] > 0) {
          this.jumpUnderTightPlatform = level;
          break;
        }
      }

      if (this.jumpUnderTightPlatform) {
        const correct = [3, 7, 7, 4, 3, 3];

        if (correct[this.actionPhase - 4]) {
          this.correctY = correct[this.actionPhase - 4];
        }
      }
    }

    // Handle the agent leaving the room. Sounds stop the moment
    // the threshold is crossed, before the screen transition.
    if (layoutManager.hasLeftDoor(game.getRoomId()) && this.x < -28) {
      audio.stopAllSounds();
      onLeaveRoom?.("left");
    }

    if (layoutManager.hasRightDoor(game.getRoomId()) && this.x > 314) {
      audio.stopAllSounds();
      onLeaveRoom?.("right");
    }

    // Collision with deadly things. The orb is deadly even during
    // snooze time; robots and their zaps only when not snoozing.
    // The STAYFOREVER cheat disarms both.
    if (cheats.isInvincible()) return;

    const currentRoom = game.getRoom(game.getRoomId());
    const orb = currentRoom?.getOrb();

    if (orb && orb.getStatus() !== "destroyed" && this.collisionWithOrb(orb)) {
      this.dieByZapFrames = 1;
      return;
    }

    const robots = currentRoom?.getRobots() ?? [];

    if (
      robots.length &&
      !game.getSnoozeTime() &&
      this.collisionWithRobots(robots)
    ) {
      this.dieByZapFrames = 1;
      return;
    }
  }

  /**
   * Pixel-accurate collision against the orb: a cheap bounding
   * box test first, then the agent's pixel mask against the orb's
   * inner body.
   */
  private collisionWithOrb(orb: Orb): boolean {
    const bx = orb.getX();
    const by = orb.getY();
    const dx = this.x;
    const dy = this.y + this.correctY;

    if (!sprites.collisionDetect(bx, by, 24, 19, dx, dy, 35, 41)) return false;

    let action = this.action;
    if (action === "lift") action = "stand";

    const collisionMap =
      this.collisionMap[this.direction][
        action as "stand" | "run" | "jump" | "fall" | "search"
      ][this.actionPhase].split(",");

    if (collisionMap.length < 41) return false;

    for (let row = 0; row < 41; row++) {
      for (let col = 0; col < 35; col++) {
        if (collisionMap[row][col] === "0") continue;

        if (
          dx + col >= bx + 2 &&
          dx + col <= bx + 20 &&
          dy + row >= by + 1 &&
          dy + row <= by + 17
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Pixel-accurate collision against every robot body and, for
   * zapping robots, the 48px beam beside them.
   */
  private collisionWithRobots(robots: Robot[]): boolean {
    const dx = this.x;
    const dy = this.y + this.correctY;

    let action = this.action;
    let phase = this.actionPhase;
    if (action === "lift") {
      action = "stand";
      phase = 0;
    }

    const collisionMap =
      this.collisionMap[this.direction][
        action as "stand" | "run" | "jump" | "fall" | "search"
      ][phase].split(",");

    if (collisionMap.length < 41) return false;

    for (const robot of robots) {
      const ex = robot.getX();
      const ey = robot.getY();
      const zx = robot.getGraphicsPhase() === 1 ? ex - 48 : ex + 14;

      const bodyHit = sprites.collisionDetect(ex, ey, 14, 21, dx, dy, 35, 41);
      let zapHit = true;
      if (robot.getAction() === "zapping") {
        zapHit = sprites.collisionDetect(zx, ey, 48, 10, dx, dy, 35, 41);
      }
      if (!zapHit && !bodyHit) continue;

      for (let row = 0; row < 41; row++) {
        for (let col = 0; col < 35; col++) {
          if (collisionMap[row][col] === "0") continue;

          // Collision with the robot body.
          if (
            dx + col >= ex &&
            dx + col <= ex + 14 &&
            dy + row >= ey &&
            dy + row <= ey + 21
          ) {
            return true;
          }

          // Collision with the zap beam.
          if (robot.getAction() === "zapping") {
            if (
              dx + col >= zx &&
              dx + col <= zx + 48 &&
              dy + row >= ey &&
              dy + row <= ey + 10
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private detectFalling() {
    // Falling detection: Check immediately after movement to catch
    // gaps. When the agent steps off a platform, capture their
    // current pose to start the fall animation naturally. This
    // prevents jarring transitions by using the agent's last pose
    // before falling as the initial falling frame:
    //  - Falling after jump: Use jump[11] (final jump frame)
    //  - Falling after quick step: Use run[5] (quick step pose)
    //  - Falling after slide/normal run: Use run[6] (slide pose)
    //  - Falling from stand: Uses stand[0] (set during init)
    if (this.isFalling()) {
      if (this.action === "jump") {
        // Agent ran off the edge during a jump so I have to use
        // the final jump pose.
        this.animation[this.direction].fall[0] =
          this.animation[this.direction].jump[11];

        this.collisionMap[this.direction].fall[0] = this.getCollisionMap(
          this.direction,
          "jump",
          11,
        );
      } else if (this.action === "run") {
        // Agent ran off the edge during running so I have to use
        // the appropriate run pose.
        if (this.actionPhase === 5) {
          // Quick step pose (phase 5).
          this.animation[this.direction].fall[0] =
            this.animation[this.direction].run[5];
          this.collisionMap[this.direction].fall[0] = this.getCollisionMap(
            this.direction,
            "run",
            5,
          );
        } else {
          // Slide or normal run pose (phase 6).
          this.animation[this.direction].fall[0] =
            this.animation[this.direction].run[6];
          this.collisionMap[this.direction].fall[0] = this.getCollisionMap(
            this.direction,
            "run",
            6,
          );
        }
      }

      // Transition to falling state.
      this.action = "fall";
      this.actionPhase = 0;
    }
  }

  animationRoutine() {
    if (this.action === "fallDown") return;

    // The zap death animation: instead of the sprite, the agent's
    // own pixel mask is drawn in cycling zap colors while random
    // pixels progressively dissolve away.
    if (this.dieByZapFrames > 0) {
      const dx = this.x;
      const dy = this.y + this.correctY;

      let action = this.action;
      let phase = this.actionPhase;
      if (action === "lift") {
        action = "stand";
        phase = 0;
      }

      const collisionMap =
        this.collisionMap[this.direction][
          action as "stand" | "run" | "jump" | "fall" | "search"
        ][phase].split(",");

      if (collisionMap.length < 41) return;

      const afc = gameTime.getAFC();
      const c1 = [1, 11, 12, 15, 1, 11, 12, 15, 1, 11, 12, 15][afc % 12];
      const c2 = [11, 12, 15, 1, 12, 15, 1, 11, 15, 1, 11, 12][afc % 12];

      for (let row = 0; row < 41; row++) {
        for (let col = 0; col < 35; col++) {
          if (collisionMap[row][col] === "0") continue;

          const key = `${dx + col},${dy + row}`;

          // Late in the death, random pixels start disappearing
          // for good.
          if (
            this.dieByZapFrames > 25 &&
            rnd(80 - this.dieByZapFrames) < 5 &&
            !this.dieByZapErase.has(key)
          ) {
            this.dieByZapErase.add(key);
          }

          if (!this.dieByZapErase.has(key)) {
            if (collisionMap[row][col] === "1") {
              graphics.rect(dx + col, dy + row, 1, 1, c1);
            } else if (collisionMap[row][col] === "2") {
              graphics.rect(dx + col, dy + row, 1, 1, c2);
            }
          }
        }
      }

      return;
    }

    // A lift ride draws the standing sprite.
    if (this.action === "stand" || this.action === "lift") {
      const directionAnim = this.animation[this.direction];

      if (!directionAnim) return;

      const agentImage = directionAnim["stand"][0];
      graphics.draw(
        agentImage.x,
        agentImage.y,
        AGENT_FRAME_SIZE.w,
        AGENT_FRAME_SIZE.h,
        this.x,
        this.y + this.correctY,
      );
    } else {
      // Handle agent running. Playing the organ shows the search
      // pose (reaching toward the console).
      const directionAnim = this.animation[this.direction];

      if (!directionAnim) return;

      // This branch is only reached for run/jump/fall/search (and
      // organ, remapped to search), all of which have frames.
      const drawAction = (
        this.action === "organ" ? "search" : this.action
      ) as "run" | "jump" | "fall" | "search";
      const drawPhase = this.action === "organ" ? 0 : this.actionPhase;
      const actionFrames = directionAnim[drawAction];

      if (!actionFrames || !actionFrames[drawPhase]) return;

      const agentImage = actionFrames[drawPhase];

      graphics.draw(
        agentImage.x,
        agentImage.y,
        AGENT_FRAME_SIZE.w,
        AGENT_FRAME_SIZE.h,
        this.x,
        this.y + this.correctY,
      );
    }

    if (sceneManager.getScene() === "elevator") {
      // Make sure the agent appears behind the elevator border.
      // Left side.
      graphics.drawSprite(SHAFT_BORDER_OVERLAY_LEFT, 136, 39);

      // Right side.
      graphics.drawSprite(SHAFT_BORDER_OVERLAY_RIGHT, 178, 39);
    }

    // The search box: progress bar while searching, then the
    // result (nothing / snooze sign / lift-init sign / the found
    // puzzle piece).
    if (
      sceneManager.getScene() === "room" &&
      this.action === "search" &&
      this.searchedFurniture
    ) {
      let boxX = this.x + 40;
      if (boxX > 250) boxX = this.x - 65;
      let boxY = this.y - 9;
      if (boxY < 0) boxY = 0;

      const roomBgColor = (
        roomColors as Record<number, { bg: number }>
      )[game.getRoomId()].bg;

      graphics.rect(boxX, boxY, 64, 32, 1);

      if (this.searchedFurniture.getSearchTime() > 0) {
        graphics.text("Searching", boxX, boxY + 13, roomBgColor, 21, false);
        graphics.rect(
          boxX,
          boxY + 21,
          this.searchedFurniture.getSearchTime(),
          3,
          roomBgColor,
        );
      } else {
        const contents = this.searchedFurniture.getContents();

        if (contents === "nothing") {
          graphics.text("Nothing", boxX + 5, boxY + 15, roomBgColor, 24, false);
          graphics.text("here.", boxX + 15, boxY + 26, roomBgColor, 24, false);
        }

        if (contents === "snooze") {
          graphics.drawSprite(
            SNOOZE_SIGN_BY_ROOM_BG[roomBgColor] ??
              SNOOZE_SIGN_BY_ROOM_BG[SIGN_FALLBACK_ROOM_BG],
            boxX + 8,
            boxY + 8,
          );
        }

        if (contents === "liftReset") {
          graphics.drawSprite(
            LIFT_INIT_SIGN_BY_ROOM_BG[roomBgColor] ??
              LIFT_INIT_SIGN_BY_ROOM_BG[SIGN_FALLBACK_ROOM_BG],
            boxX + 18,
            boxY + 8,
          );
        }

        if (contents === "puzzle") {
          this.searchedFurniture.getPuzzle()?.draw(boxX + 8, boxY + 8);
        }
      }
    }
  }

  stand() {
    this.action = "stand";
    this.actionPhase = 0;
    this.correctY = 0;
    this.newLevelAfterJump = false;
    this.jumpUnderTightPlatform = false;
    this.fallDuration = 0;
  }

  private isFalling() {
    // The AIRWALK cheat: the agent never falls, so gaps can be
    // walked straight across.
    if (cheats.canWalkOnAir()) return false;

    // Falling only applies to these actions; "lift" in particular
    // is excluded, which is what keeps a lift ride stable.
    if (
      this.action !== "stand" &&
      this.action !== "run" &&
      this.action !== "jump" &&
      this.action !== "fall"
    ) {
      return false;
    }

    // Don't check falling when agent is at room boundaries.
    if (this.x >= 303 || this.x <= -20) return false;

    // The agent's foot pixels: the second-to-last row of the
    // current pose's pixel mask. Airborne poses (mid-jump frames)
    // have no foot pixels at all, so a jump arc can never trigger
    // a fall before its final frame — this is what makes gaps
    // jumpable.
    const mask: string =
      this.collisionMap[this.direction][this.action][this.actionPhase];

    // Masks are empty until initializeCollisionMaps() runs with
    // sprites loaded; treat that as "not falling" rather than
    // reading garbage.
    if (!mask) return false;

    const foot = mask.split(",").slice(-2)[0] ?? "";

    let footOnFloor = 0;
    for (let i = 0; i < 35; i++) {
      if (foot[i] !== "0") footOnFloor++;
    }
    if (!footOnFloor) return false;

    // If the feet are not aligned exactly with a platform level,
    // the agent is mid-air.
    if ((this.y + 39) % 8) return true;

    // Calculate which platform level the agent is currently on.
    const level = (this.y + 39) / 8;
    const roomId = game.getRoomId();
    const liftGroups = game.getRoom(roomId)?.getLiftGroups() || [];

    // Borders count as ground here (and only here), so the agent
    // can stand in a doorway.
    const px = this.getSafetyPixels(level, roomId, true, liftGroups);

    // The agent stays up while any foot pixel rests on something
    // solid. Requiring half the foot made room 24's upper floors
    // unreachable: the jump from its right-hand lift lands on the
    // second-floor ledge with only a couple of foot pixels on it,
    // and in the original (checked in VICE) that landing holds.
    for (let i = 0; i < 35; i++) {
      if (foot[i] !== "0" && px[this.x + i] !== "0") return false;
    }

    return true;
  }

  /**
   * The visible furniture item the agent is standing in front
   * of, if any.
   */
  private standingOnFurniture(): Furniture | false {
    const room = game.getRoom(game.getRoomId());
    if (!room) return false;

    for (const furniture of room.getFurnitureItems()) {
      if (!furniture.isVisible()) continue;

      const top = (this.y + 39) / 8 - 1;
      if (furniture.getBottom() !== top) continue;

      const fp = (
        furnitureProperties as Record<string, { w: number }>
      )[furniture.getKind()];

      if (
        this.x + 19 > furniture.getLeft() * 8 &&
        this.x + 15 <= furniture.getLeft() * 8 + fp.w
      ) {
        return furniture;
      }
    }

    return false;
  }

  /**
   * The terminal the agent is standing in front of, if any.
   */
  private standingOnTerminal() {
    const room = game.getRoom(game.getRoomId());
    if (!room) return false;

    for (const terminal of room.getTerminals()) {
      const top = (this.y + 39) / 8 - 1;
      if (terminal.getBottom() !== top) continue;

      if (
        this.x + 17 > terminal.getLeft() * 8 &&
        this.x + 17 <= terminal.getLeft() * 8 + 24
      ) {
        return terminal;
      }
    }

    return false;
  }

  private standingOnLift(liftGroups: InnerLift[]): InnerLift | false {
    for (const liftGroup of liftGroups) {
      for (const liftPosition of liftGroup.getLifts()) {
        // The agent's feet must be exactly at the lift platform.
        if (this.y + 39 !== liftPosition) continue;

        // Check horizontal position based on direction
        if (
          this.direction === "left" &&
          this.x + 17 > liftGroup.getLeft() * 8 &&
          this.x - 1 <= liftGroup.getLeft() * 8
        ) {
          return liftGroup;
        }

        if (
          this.direction === "right" &&
          this.x + 14 > liftGroup.getLeft() * 8 &&
          this.x - 6 <= liftGroup.getLeft() * 8
        ) {
          return liftGroup;
        }
      }
    }

    return false;
  }

  private getCollisionMap(
    direction: "left" | "right",
    action: "stand" | "run" | "jump" | "fall" | "search",
    phase: number,
  ) {
    if (!sprites.hasSpriteSheet()) {
      return "";
    }

    const canvas = document.createElement("canvas");
    canvas.width = 35;
    canvas.height = 41;

    const canvasContext = graphics.getRenderingContext2D(canvas);
    const frame = this.animation[direction][action][phase];
    const spriteSheet = sprites.getSpriteSheet();

    canvasContext.drawImage(
      spriteSheet,
      frame.x,
      frame.y,
      35,
      41,
      0,
      0,
      35,
      41,
    );

    const baseSpriteData = canvasContext.getImageData(0, 0, 35, 41);
    const baseSpritePixels = baseSpriteData.data;

    let map = "";

    for (let i = 0, n = baseSpritePixels.length; i < n; i += 4) {
      const c = getColorIndex(
        baseSpritePixels[i],
        baseSpritePixels[i + 1],
        baseSpritePixels[i + 2],
      );
      const o = baseSpritePixels[i + 3];

      if (o == 0) map += "0";
      else if (c == 1) map += "1";
      else if (c == 11) map += "2";

      if ((i + 4) % 140 === 0) map += ",";
    }

    return map;
  }

  private getSafetyPixels(
    level: number,
    roomId: number,
    needBorders = true,
    liftGroups: InnerLift[] = [],
  ) {
    const px = [];

    for (let i = 0; i < 320; i++) {
      if (needBorders && (i < 8 || i > 311)) {
        px[i] = "3";
      } else {
        px[i] = "0";
      }
    }

    // Add platforms on this level to safety pixels.
    const p = roomPlatforms[roomId as keyof typeof roomPlatforms];

    for (const platform of p) {
      if (platform.y != level) continue;

      for (let j = platform.x * 8; j < platform.x * 8 + platform.l * 8; j++) {
        px[j] = "1";
      }
    }

    // Add inner lifts on this level to safety pixels, using the
    // live platform positions. A lift is solid only when it sits
    // exactly at this level — a platform caught mid-travel
    // supports nothing.
    for (const lift of liftGroups) {
      for (const liftPosition of lift.getLifts()) {
        if (liftPosition === level * 8) {
          for (let k = lift.getLeft() * 8; k < lift.getLeft() * 8 + 24; k++) {
            px[k] = "2";
          }
        }
      }
    }

    return px;
  }
}

export const agent: Agent = new Agent();
