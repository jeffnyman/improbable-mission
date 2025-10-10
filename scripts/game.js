import { Agent } from "./agent";
import { Room } from "./room";
import { Puzzle } from "./puzzle";
import { Elevator } from "./elevator";
import { PocketComputer } from "./pocketComputer";
import { utils } from "./utils";
import * as Layout from "./layout";

// import { LayoutValidator } from "./layoutValidate";

export class Game {
  constructor() {
    this.engine = null;
    this.utils = utils;
    this.rooms = {};
    this.pause = false;
    this.scene = null;

    this.agent = new Agent();
    this.elevator = new Elevator();
    this.pocketComputer = new PocketComputer();

    this.mapId = this.utils.rnd(Layout.maps.length) - 1;
    this.map = Layout.maps[this.mapId];

    // DEBUGGING
    // console.log(`Map ID: ${this.mapId}`); // REMOVE
    // console.log(`Map: ${JSON.stringify(this.map)}`); // REMOVE

    this.timeoutAnotherVisitor = false;
  }

  init(engine) {
    this.engine = engine;
    this.scene = "anotherVisitor";

    this.agent.init();
    this.elevator.init(this);
    this.pocketComputer.init();

    // DEBUGGING
    // const validator = new LayoutValidator();
    // const results = validator.validateAllMaps();
    // console.log(validator.printSummary(results));

    this.generateRooms();
    this.placeItems();

    // this.printRoomsByFloor(); // DEBUGGING
  }

  animateElevator() {
    this.elevator.animationRoutine();
  }

  scanAnotherVisitor() {
    if (!this.timeoutAnotherVisitor) {
      this.engine.audio.request({ name: "anotherVisitor" });

      this.timeoutAnotherVisitor = setTimeout(function () {
        this.scene = "elevator";
      }, 6500);
    }
  }

  generateRooms() {
    for (var i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(this, i);
      this.rooms[i].init();
    }
  }

  placeItems() {
    this.placePuzzles();
    this.placeSnoozes();
    this.placeLiftResets();
  }

  placePuzzles() {
    for (var i = 0; i < 36; ) {
      let roomId = utils.rnd(30);
      let furnitureCount = this.rooms[roomId].furnitureItems.length;

      if (!furnitureCount) continue;

      let index = utils.rnd(furnitureCount) - 1;

      if (this.rooms[roomId].furnitureItems[index].type == "exit") continue;

      if (this.rooms[roomId].furnitureItems[index].contents == "nothing") {
        this.rooms[roomId].furnitureItems[index].contents = "puzzle";
        this.rooms[roomId].furnitureItems[index].puzzle = new Puzzle(i);
        this.rooms[roomId].furnitureItems[index].puzzle.setProperties(
          Layout.roomColors[roomId].bg,
        );
        i++;
      }
    }
  }

  placeSnoozes() {
    for (var i = 0; i < 9; ) {
      let roomId = utils.rnd(30);
      let furnitureCount = this.rooms[roomId].furnitureItems.length;

      if (!furnitureCount) continue;

      let index = utils.rnd(furnitureCount) - 1;

      if (this.rooms[roomId].furnitureItems[index].type == "exit") continue;

      if (this.rooms[roomId].furnitureItems[index].contents == "nothing") {
        this.rooms[roomId].furnitureItems[index].contents = "snooze";
        i++;
      }
    }
  }

  placeLiftResets() {
    for (var i = 0; i < 9; ) {
      let roomId = utils.rnd(30);

      let furnitureCount = this.rooms[roomId].furnitureItems.length;

      if (!furnitureCount) continue;

      let index = utils.rnd(furnitureCount) - 1;

      if (this.rooms[roomId].furnitureItems[index].type == "exit") continue;

      if (this.rooms[roomId].furnitureItems[index].contents == "nothing") {
        this.rooms[roomId].furnitureItems[index].contents = "liftReset";
        i++;
      }
    }
  }

  togglePause(status) {
    console.log(`game paused: ${status}`); // REMOVE

    if (status === undefined) {
      status = this.pause ? false : true;
    }

    this.pause = status;

    return status;
  }

  printRoomsByFloor() {
    const byFloor = {};

    for (const roomId in this.rooms) {
      const room = this.rooms[roomId];
      if (!byFloor[room.floorLevel]) byFloor[room.floorLevel] = [];
      byFloor[room.floorLevel].push(room);
    }

    console.log("\n=== ROOMS BY FLOOR ===");
    Object.keys(byFloor)
      .sort((a, b) => a - b)
      .forEach((floor) => {
        console.log(`\nFloor ${floor}:`);
        byFloor[floor].forEach((room) => {
          console.log(
            `  Room ${room.roomId}: ElevL=${room.elevatorLeft}, ElevR=${room.elevatorRight}`,
          );
        });
      });
  }
}
