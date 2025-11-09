import { maps } from "./data/layout";
import { audio } from "./components/audio";
import { Room } from "./components/room";
import { Agent } from "./components/agent";
import { Elevator } from "./components/elevator";
import { PocketComputer } from "./components/pocketComputer";
import { checkLayout } from "./utils/checkLayout";

export class Game {
  private agent: Agent = new Agent();
  private elevator: Elevator = new Elevator();
  private pocketComputer: PocketComputer = new PocketComputer();

  private scene = "";
  private paused = false;

  private rooms: Record<number, Room> = {};

  // These variables will hold the actual room ID as well
  // the actual room object.
  private roomId!: number;
  private room!: Room;

  private mapId!: number;
  private map!: {
    rooms: Record<string, number[]>;
  };

  // The screen transition can be false (not happening),
  // "opening," or "closing." The transition height can
  // be a value from 0 to 100.
  private transitionState: false | "closed" | "open" = false;
  private transitionHeight = 0;
  public transitionFunction?: () => void;

  init(
    sprites: Record<string, HTMLImageElement>,
    baseSpritePixels: Uint8ClampedArray,
    spriteWidth: number,
    spriteHeight: number,
    gameSprites: HTMLImageElement,
    paletteName: string,
  ) {
    this.scene = "anotherVisitor";

    this.mapId = maps.length - 1;
    this.map = maps[this.mapId];

    console.log(`Game.mapId: ${this.mapId}`); // REMOVE
    console.log(`Game.map.rooms: ${JSON.stringify(this.map.rooms)}`); // REMOVE

    this.elevator.init(
      this.map.rooms,
      sprites,
      baseSpritePixels,
      spriteWidth,
      spriteHeight,
    );
    this.generateRooms(gameSprites, paletteName);
    this.pocketComputer.init(this.map.rooms, this.rooms);

    this.printRoomsByFloor(); // DEBUGGING
  }

  generateRooms(gameSprites: HTMLImageElement, paletteName: string) {
    for (let i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(i);
      this.rooms[i].init(this.map.rooms, gameSprites, paletteName);
    }
  }

  currentScene(): string {
    return this.scene;
  }

  getTransitionState() {
    return this.transitionState;
  }

  setTransitionState(state: false | "closed" | "open") {
    this.transitionState = state;
  }

  getTransitionHeight() {
    return this.transitionHeight;
  }

  setTransitionHeight(height: number) {
    this.transitionHeight = height;
  }

  scanAnotherVisitor() {
    this.pocketComputer.setVisibleState(true);
    this.scene = "elevator";
  }

  scanRoom() {
    this.room.scanRoutine();
    this.agent.scanRoutine(
      this.scene,
      this.pocketComputer.getState(),
      {
        ...this.elevator.getCurrentPosition(),
        mapRooms: this.map.rooms,
      },
      this.roomId,
      (direction) => {
        this.startTransition(() => {
          this.leaveRoom(direction);
        });
      },
    );
  }

  scanElevator() {
    this.elevator.scanRoutine(
      this.pocketComputer.getState(),
      this.agent.getCurrentState(),
      (direction) => {
        this.startTransition(() => {
          this.enterRoom(direction);
        });
      },
    );

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
      this.agent.scanRoutine(this.scene, pcState, {
        ...this.elevator.getCurrentPosition(),
        mapRooms: this.map.rooms,
      });
    }
  }

  animateRoom() {
    this.room.animationRoutine();
    this.agent.animationRoutine(this.scene);
  }

  animateElevator() {
    this.elevator.animationRoutine();
    const elevatorPos = this.elevator.getCurrentPosition();
    this.pocketComputer.animationRoutine(elevatorPos);
    this.agent.animationRoutine(this.scene);
  }

  leaveRoom(direction: string) {
    console.log(direction);

    if (direction === "left") {
      this.elevator.change(this.room.getElevatorLeft());
      this.elevator.setY(
        this.room.getFloorLevel() * 432 +
          (checkLayout.hasLeftDoor(this.roomId) === 1 ? 0 : 216),
      );

      this.agent.setDirection("left");
      this.agent.setX(300);
      this.agent.setY(45);
    }

    if (direction === "right") {
      this.elevator.change(this.room.getElevatorRight());
      this.elevator.setY(
        this.room.getFloorLevel() * 432 +
          (checkLayout.hasRightDoor(this.roomId) === 2 ? 0 : 216),
      );

      this.agent.setDirection("right");
      this.agent.setX(-16);
      this.agent.setY(45);
    }

    // Reset the elevator direction to ensure it's stationary.
    // Reset the elevator sound as well since the elevator
    // should not be moving.
    this.elevator.setDirection("");
    this.elevator.setSound(false);

    this.agent.stand();

    this.scene = "elevator";
  }

  enterRoom(direction: string) {
    this.agent.setRoomEnterDirection(direction);

    const elevatorPos = this.elevator.getCurrentPosition();
    const rooms = this.map.rooms[elevatorPos.x - (direction == "left" ? 1 : 0)];
    const level = Math.floor(elevatorPos.y / 216 / 2);

    this.roomId = rooms[level];
    this.room = this.rooms[this.roomId];

    this.agent.setStartPosition(this.roomId);

    this.room.setRevealed(true);
    this.scene = "room";
  }

  startTransition(cb: () => void) {
    this.transitionState = "closed";
    this.transitionHeight = 0;
    this.transitionFunction = () => {
      cb();
    };
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
