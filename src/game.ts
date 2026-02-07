import { agent } from "./component/agent";
import { elevator } from "./component/elevator";
import { gameTime } from "./common/gameTime";
import { sceneManager } from "./common/sceneManager";
import { pocketComputer } from "./component/pocketComputer";
import { Room } from "./component/room";
import { audio } from "./common/audioManager";
import { graphics } from "./utils/graphics";
import { maps } from "./data/layout";
import { log } from "./utils/logger";

class Game {
  private scanFrameCounter = 0;
  private paused = false;

  // All room instances indexed by room ID.
  private rooms: Record<number, Room> = {};

  // The room the agent is currently in.
  private room: Room | null = null;

  // The ID of the currently active room. This is set when the
  // agent enters a room from the elevator.
  private roomId: number;

  // The map layout defining which room IDs exist at each
  // coordinate.
  private map: { rooms: number[][] };

  // The screen transition can be false (not happening), opening
  // (an "open" transition) or closing (a "close" transition).
  private transitionState: false | "close" | "open" = false;

  // The transition height can be a value from 0 to 100.
  private transitionHeight = 0;

  // Callback function to execute when the screen transition
  // completes e.g., entering or leaving a room). This is set
  // by startTransition().
  private transitionFunction?: () => void;

  constructor() {
    const mapId = maps.length - 1;
    this.map = maps[mapId];

    // This is being done to make sure the roomId is set but
    // it's being set to an invalid value.
    this.roomId = -1;

    log(`map.id: ${mapId}`);
    log(`map.rooms: ${JSON.stringify(this.map.rooms)}`);
  }

  init() {
    this.generateRooms();
  }

  getRoomId() {
    return this.roomId;
  }

  getMap() {
    return this.map;
  }

  updateScan() {
    // Increment the local frame counter and sync it to the global
    // gameTime singleton. This allows other components to query the
    // current frame without depending on Game.
    this.scanFrameCounter++;
    gameTime.setSFC(this.scanFrameCounter);

    // Clear audio queue from previous frame before processing
    // new requests.
    audio.emptyRequestQueue();

    if (!this.transitionState) {
      if (sceneManager.getScene() === "elevator") {
        elevator.scanRoutine((direction) => {
          this.startTransition(() => {
            this.enterRoom(direction);
          });
        });

        // Reveal the map portion on the pocket computer. This
        // will show the level of the elevator system.
        const pos = elevator.getCurrentPosition();

        if (pos.y % 216 === 0) {
          const level = Math.floor(pos.y / 216 / 2);

          // Convert 1-indexed elevator position to 0-indexed
          // for the array.
          pocketComputer.revealMapSection(pos.x - 1, level);
        }

        agent.scanElevatorScene();
      }

      if (sceneManager.getScene() === "room") {
        agent.scanRoomScene((direction) => {
          this.startTransition(() => {
            this.leaveRoom(direction);
          });
        });
      }
    }

    // Play all sounds requested during this frame.
    audio.playQueue();
  }

  updateAnimation() {
    if (this.transitionState) {
      if (this.transitionState === "close") {
        this.transitionHeight = this.transitionHeight + 7;

        if (this.transitionHeight >= 120) {
          this.transitionState = "open";

          if (this.transitionFunction) {
            this.transitionFunction();
            this.transitionFunction = undefined;
          }
        }
      } else if (this.transitionState === "open") {
        this.transitionHeight = this.transitionHeight - 7;

        if (this.transitionHeight <= 0) {
          this.transitionState = false;
        }
      }
    }

    if (sceneManager.getScene() === "elevator") {
      elevator.animationRoutine();
      pocketComputer.animationRoutine();
      agent.animationRoutine();
    }

    if (sceneManager.getScene() === "room") {
      if (this.room) {
        this.room.animationRoutine();
        agent.animationRoutine();
      }
    }

    // This handles the transition between elevator shafts and
    // the rooms. This must be drawn AFTER scene rendering so
    // it appears on top.
    if (this.transitionState) {
      graphics.rect(0, 100, 320, -this.transitionHeight, 0);
      graphics.rect(0, 100, 320, +this.transitionHeight, 0);
    }
  }

  isPaused(): boolean {
    return this.paused;
  }

  togglePause(status?: boolean): boolean {
    if (status === undefined) {
      status = !this.paused;
    }

    this.paused = status;
    const context = audio.getContext();

    if (!context) return status;

    if (this.paused) {
      context.suspend();
    } else {
      context.resume();
    }

    return status;
  }

  private leaveRoom(direction: string) {
    if (direction === "left") {
      agent.setDirection("left");
      agent.setX(300);
      agent.setY(45);
    }

    if (direction === "right") {
      agent.setDirection("right");
      agent.setX(-16);
      agent.setY(45);
    }

    agent.setAction("stand");

    sceneManager.setScene("elevator");
  }

  private enterRoom(direction: string) {
    agent.setRoomEnterDirection(direction);

    const elevatorPos = elevator.getCurrentPosition();
    const level = Math.floor(elevatorPos.y / 216 / 2);
    const elevatorIndex = elevatorPos.x - (direction === "left" ? 1 : 0);

    this.roomId = this.map.rooms[level][elevatorIndex];

    this.room = this.rooms[this.roomId];
    agent.setStartPosition(this.roomId);

    sceneManager.setScene("room");
  }

  private startTransition(cb: () => void) {
    if (this.transitionState) {
      return;
    }

    this.transitionState = "close";
    this.transitionHeight = 0;
    this.transitionFunction = cb;
  }

  private generateRooms() {
    for (let i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(i);
      this.rooms[i].init();
    }
  }
}

export const game: Game = new Game();
