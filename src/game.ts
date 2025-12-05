import { maps } from "./data/layout";
import { audio } from "./components/audio";
import { sceneManager } from "./components/sceneManager";
import { Agent } from "./components/agent";
import { Elevator } from "./components/elevator";
import { Room } from "./components/room";
import { PocketComputer } from "./components/pocketComputer";
import { log } from "./utils/logger";
import { gameTime } from "./utils/gameTime";

export class Game {
  private agent: Agent = new Agent();
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();
  private paused = false;
  private scanFrameCounter = 0;
  private map: { rooms: Record<number, number[]> };
  private rooms: Record<number, Room> = {};

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

    if (sceneManager.getScene() === "elevator") {
      this.elevator.scanRoutine(this.agent.getX(), this.agent.getAction());
      this.agent.scanRoutine(this.elevator.getCurrentPosition());
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

  private generateRooms() {
    for (let i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(i, this.map.rooms);
      this.rooms[i].init();
    }
  }
}
