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
    console.log(`Game.map.rooms: ${JSON.stringify(this.map.rooms)}`); // REMOVE

    this.elevator.init(this.map.rooms);
    this.generateRooms();
    this.pocketComputer.init(this.map.rooms, this.rooms);

    this.printRoomsByFloor(); // DEBUGGING
  }

  generateRooms() {
    for (let i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(i);
      this.rooms[i].init(this.map.rooms);
    }
  }

  currentScene(): string {
    return this.scene;
  }

  scanElevator() {
    this.elevator.scanRoutine();

    // Reveal the map portion on the pocket computer. This will
    // show the level of the elevator system.
    const pos = this.elevator.getCurrentPosition();
    if (pos.y % 216 === 0) {
      const level = Math.floor(pos.y / 216 / 2);
      this.pocketComputer.revealMapSection(pos.x, level);
    }

    if (
      !this.elevator.getCurrentDirection() &&
      this.pocketComputer.getState() === "map"
    ) {
      const pcState = this.pocketComputer.getState();
      this.agent.scanRoutine(this.scene, pcState);
    }
  }

  animateElevator() {
    this.elevator.animationRoutine();
    const elevatorPos = this.elevator.getCurrentPosition();
    this.pocketComputer.animationRoutine(elevatorPos);
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

  printRoomsByFloor() {
    const byFloor: Record<number, Room[]> = {};

    for (const roomId in this.rooms) {
      const room = this.rooms[roomId];
      // @ts-expect-error - Debug method, types not critical
      if (!byFloor[room.floorLevel]) byFloor[room.floorLevel] = [];
      // @ts-expect-error - Debug method, types not critical
      byFloor[room.floorLevel].push(room);
    }

    console.log("\n=== ROOMS BY FLOOR ===");

    Object.keys(byFloor)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((floor) => {
        console.log(`\nFloor ${floor}:`);
        // @ts-expect-error - Debug method, types not critical
        byFloor[floor].forEach((room) => {
          console.log(
            `  Room ${room.roomId}: ElevL=${room.elevatorLeft}, ElevR=${room.elevatorRight}`,
          );
        });
      });
  }
}
