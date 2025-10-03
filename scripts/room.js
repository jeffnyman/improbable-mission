import { utils } from "./utils";

export class Room {
  constructor(game, roomId) {
    this.utils = utils;
    this.game = game;
    this.roomId = roomId;
    this.floorLevel = -1;
    this.elevatorLeft = 0;
    this.elevatorRight = 0;
  }

  init() {
    for (var i = 0; i < 9; i++) {
      var column = this.game.map.rooms[i];
      var row = column.indexOf(this.roomId);

      if (row !== -1) {
        this.floorLevel = row;
        if (this.utils.hasLeftDoor(this.roomId)) this.elevatorLeft = i;

        console.log(
          `Room ${this.roomId}: Found at floor level ${this.floorLevel} (column ${i}, row ${row})`,
        ); // REMOVE
        console.log(`Elevator Left: ${this.elevatorLeft}`); // REMOVE
        console.log(`Elevator Right: ${this.elevatorRight}`); // REMOVE

        break;
      }
    }
  }
}
