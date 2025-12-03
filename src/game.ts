import { maps } from "./data/layout";
import { audio } from "./components/audio";
import { sceneManager } from "./components/sceneManager";
import { Agent } from "./components/agent";
import { Elevator } from "./components/elevator";
import { PocketComputer } from "./components/pocketComputer";
import { log } from "./utils/logger";

export class Game {
  private agent: Agent = new Agent();
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();
  private paused = false;

  init() {
    const mapId = maps.length - 1;
    const map = maps[mapId];

    log(`Game.mapId: ${mapId}`); // REMOVE
    log(`Game.map.rooms: ${JSON.stringify(map.rooms)}`); // REMOVE

    this.elevator.init(map.rooms);
  }

  updateScan() {
    // Empty the audio request queue.
    audio.emptyRequestQueue();

    if (sceneManager.getScene() === "elevator") {
      this.elevator.scanRoutine(this.agent.getX());
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
}
