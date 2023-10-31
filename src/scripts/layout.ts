import { maps } from "./data/maps";
import { Room } from "./room";

export class Layout {
  map: { rooms: { 0: number[] } };
  rooms: Record<number, Room> = {};

  constructor() {
    console.log("Layout Constructed");

    this.map = maps[0];
    this.rooms = {};

    console.log(`MAP: ${JSON.stringify(this.map.rooms)}`); // DEBUG
  }

  generate() {
    console.log("| Generating layout |");

    this.generateRooms();
  }

  generateRooms() {
    console.log("| Generating rooms |");

    for (var i = 1; i <= 32; i++) {
      this.rooms[i] = new Room();
    }
  }
}
