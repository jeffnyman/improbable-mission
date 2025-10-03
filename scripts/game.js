import { Room } from "./room";
import { utils } from "./utils";
import * as Layout from "./layout";

export class Game {
  constructor() {
    this.utils = utils;
    this.rooms = {};

    this.mapId = this.utils.rnd(Layout.maps.length) - 1;
    this.map = Layout.maps[this.mapId];

    console.log(`Map ID: ${this.mapId}`); // REMOVE
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
