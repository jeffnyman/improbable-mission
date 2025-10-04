import { utils } from "./utils";
import { roomFurnitureItems } from "./layout";
import { Furniture } from "./furniture";

export class Room {
  constructor(game, roomId) {
    this.utils = utils;
    this.game = game;
    this.roomId = roomId;
    this.floorLevel = -1;
    this.elevatorLeft = 0;
    this.elevatorRight = 0;
    this.furnitureItems = [];
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

        // DEBUGGING
        // console.log(
        //   `Room ${this.roomId}: Column ${i}, Floor ${this.floorLevel}`,
        // ); // REMOVE
        // console.log(
        //   `  Left: elevator ${this.elevatorLeft || "none"} (${this.leftDoorPosition || "n/a"})`,
        // ); // REMOVE
        // console.log(
        //   `  Right: elevator ${this.elevatorRight || "none"} (${this.rightDoorPosition || "n/a"})`,
        // ); // REMOVE

        break;
      }
    }

    // Furniture Items
    for (var j = 0; j < roomFurnitureItems[this.roomId].length; j++) {
      var item = roomFurnitureItems[this.roomId][j];

      this.furnitureItems[j] = new Furniture(
        this.roomId,
        item.type,
        item.l,
        item.b,
      );

      this.furnitureItems[j].init();
    }
  }
}
