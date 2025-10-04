import { Room } from "./room";
import { utils } from "./utils";
import * as Layout from "./layout";

// import { LayoutValidator } from "./layoutValidate";

export class Game {
  constructor() {
    this.utils = utils;
    this.rooms = {};

    this.mapId = this.utils.rnd(Layout.maps.length) - 1;
    this.map = Layout.maps[this.mapId];

    // DEBUGGING
    // console.log(`Map ID: ${this.mapId}`); // REMOVE
    // console.log(`Map: ${JSON.stringify(this.map)}`); // REMOVE
  }

  init() {
    // DEBUGGING
    // const validator = new LayoutValidator();
    // const results = validator.validateAllMaps();
    // console.log(validator.printSummary(results));

    this.generateRooms();

    // this.printRoomsByFloor(); // DEBUGGING
  }

  generateRooms() {
    for (var i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(this, i);
      this.rooms[i].init();
    }
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
