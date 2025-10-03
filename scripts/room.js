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

        const leftDoorType = this.utils.hasLeftDoor(this.roomId);
        const rightDoorType = this.utils.hasRightDoor(this.roomId);

        if (leftDoorType) {
          this.elevatorLeft = i;
          this.leftDoorPosition = leftDoorType === 1 ? "top" : "bottom";
        }

        if (rightDoorType) {
          this.elevatorRight = i + 1;
          this.rightDoorPosition = rightDoorType === 2 ? "top" : "bottom";
        }

        console.log(
          `Room ${this.roomId}: Column ${i}, Floor ${this.floorLevel}`,
        ); // REMOVE
        console.log(
          `  Left: elevator ${this.elevatorLeft || "none"} (${this.leftDoorPosition || "n/a"})`,
        ); // REMOVE
        console.log(
          `  Right: elevator ${this.elevatorRight || "none"} (${this.rightDoorPosition || "n/a"})`,
        ); // REMOVE

        break;
      }
    }
  }
}
