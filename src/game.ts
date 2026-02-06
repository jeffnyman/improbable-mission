import { agent } from "./component/agent";
import { elevator } from "./component/elevator";
import { sceneManager } from "./common/sceneManager";
import { pocketComputer } from "./component/pocketComputer";
import { audio } from "./common/audioManager";
import { maps } from "./data/layout";
import { log } from "./utils/logger";

class Game {
  private paused = false;

  // The map layout defining which room IDs exist at each
  // coordinate.
  private map: { rooms: number[][] };

  constructor() {
    const mapId = maps.length - 1;
    this.map = maps[mapId];

    log(`map.id: ${mapId}`);
    log(`map.rooms: ${JSON.stringify(this.map.rooms)}`);
  }

  getMap() {
    return this.map;
  }

  updateScan() {
    // Clear audio queue from previous frame before processing
    // new requests.
    audio.emptyRequestQueue();

    if (sceneManager.getScene() === "elevator") {
      elevator.scanRoutine();
    }

    // Play all sounds requested during this frame.
    audio.playQueue();
  }

  updateAnimation() {
    if (sceneManager.getScene() === "elevator") {
      elevator.animationRoutine();
      pocketComputer.animationRoutine();
      agent.animationRoutine();
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
}

export const game: Game = new Game();
