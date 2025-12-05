import { maps } from "./data/layout";
import { audio } from "./components/audio";
import { sceneManager } from "./components/sceneManager";
import { Agent } from "./components/agent";
import { Elevator } from "./components/elevator";
import { Room } from "./components/room";
import { PocketComputer } from "./components/pocketComputer";
import { log, logOnce } from "./utils/logger";
import { gameTime } from "./utils/gameTime";

export class Game {
  private agent: Agent = new Agent();
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();
  private paused = false;
  private scanFrameCounter = 0;
  private map: { rooms: Record<number, number[]> };
  private rooms: Record<number, Room> = {};

  // The screen transition can be false (not happening), opening
  // (an "open" transition) or closing (a "close" transition).
  private transitionState: false | "close" | "open" = false;

  // The transition height can be a value from 0 to 100.
  private transitionHeight = 0;

  private transitionFunction?: () => void;

  constructor() {
    const mapId = maps.length - 1;
    this.map = maps[mapId];

    log(`Game.mapId: ${mapId}`); // REMOVE
    log(`Game.map.rooms: ${JSON.stringify(this.map.rooms)}`); // REMOVE
  }

  init() {
    this.elevator.init(this.map.rooms);

    this.generateRooms();
  }

  updateScan() {
    this.scanFrameCounter++;
    gameTime.setSFC(this.scanFrameCounter);

    // Empty the audio request queue.
    audio.emptyRequestQueue();

    if (this.transitionState) {
      if (this.transitionState === "close") {
        this.transitionHeight = this.transitionHeight + 7;

        if (this.transitionHeight >= 120) {
          this.transitionState = "open";
          this.transitionFunction?.();
        }
      } else if (this.transitionState === "open") {
        this.transitionHeight = this.transitionHeight - 7;

        if (this.transitionHeight <= 0) {
          this.transitionState = false;
        }
      }
    } else {
      if (sceneManager.getScene() === "elevator") {
        this.elevator.scanRoutine(
          this.agent.getX(),
          this.agent.getAction(),
          (direction) => {
            this.startTransition(() => {
              this.enterRoom(direction);
            });
          },
        );
        this.agent.scanRoutine(this.elevator.getCurrentPosition());
      }
    }

    audio.playQueue();
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      this.elevator.animationRoutine();
      this.pocketComputer.animationRoutine();
      this.agent.animationRoutine();
    }
  }

  isPaused(): boolean {
    return this.paused;
  }

  togglePause(status?: boolean) {
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

  private enterRoom(direction: string) {
    logOnce("DIRECTION: ", direction); // REMOVE
  }

  private startTransition(cb: () => void) {
    this.transitionState = "close";
    this.transitionHeight = 0;
    this.transitionFunction = () => {
      cb();
    };
  }

  private generateRooms() {
    for (let i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(i, this.map.rooms);
      this.rooms[i].init();
    }
  }
}
