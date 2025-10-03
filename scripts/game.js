import { Room } from "./room";
import * as Layout from "./layout";

export class Game {
  constructor() {
    this.rooms = {};

    this.layoutId = 0;
    this.map = Layout.maps[this.layoutId];

    console.log(`Layout ID: ${this.layoutId}`); // REMOVE
    console.log(`Map: ${JSON.stringify(this.map)}`); // REMOVE
  }

  init() {
    this.generateRooms();
  }

  generateRooms() {
    for (var i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(this, i);
      this.rooms[i].init();
    }
  }
}
