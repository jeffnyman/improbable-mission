import { maps } from "./data/maps";

export class Layout {
  map: { rooms: { 0: number[] } };

  constructor() {
    console.log("Layout Constructed");

    this.map = maps[0];

    console.log(`MAP: ${JSON.stringify(this.map.rooms)}`); // DEBUG
  }

  generate() {
    console.log("| Generating layout |");

    this.generateRooms();
  }

  generateRooms() {
    console.log("| Generating rooms |");
  }
}
