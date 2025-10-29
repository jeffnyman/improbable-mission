import { maps } from "./data/layout";
import { audio } from "./components/audio";
import { Room } from "./components/room";
import { Agent } from "./components/agent";
import { Elevator } from "./components/elevator";
import { PocketComputer } from "./components/pocketComputer";

export class Game {
  private agent: Agent = new Agent();
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();

  private scene = "";
  private paused = false;

  private rooms: Record<number, Room> = {};
  private mapId!: number;
  private map!: {
    rooms: Record<string, number[]>;
  };

  init() {
    this.scene = "elevator";

    this.mapId = maps.length - 1;
    this.map = maps[this.mapId];

    console.log(`Game.mapId: ${this.mapId}`); // REMOVE
    console.log(`Game.map: ${JSON.stringify(this.map)}`); // REMOVE

    this.generateRooms();
  }

  generateRooms() {
    for (let i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(i);
      this.rooms[i].init();
    }
  }

  currentScene(): string {
    return this.scene;
  }

  scanElevator() {
    this.elevator.scanRoutine();
  }

  animateElevator() {
    this.elevator.animationRoutine();
    this.pocketComputer.animationRoutine();
    this.agent.animationRoutine();
  }

  isPaused(): boolean {
    return this.paused;
  }

  pause() {
    this.togglePause(true);
  }

  unpause() {
    this.togglePause(false);
  }

  togglePause(status?: boolean) {
    if (status === undefined) {
      status = !this.paused;
    }

    this.paused = status;

    if (this.paused) {
      audio.stopAllSounds();
    }

    return status;
  }
}
