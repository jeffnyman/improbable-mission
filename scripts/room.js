import { utils } from "./utils";
import {
  roomFurnitureItems,
  roomTerminalItems,
  innerLiftItems,
  blackBallEnemies,
} from "./layout";
import { Furniture } from "./furniture";
import { Terminal } from "./terminal";
import { InnerLift } from "./innerLift";
import { BlackBall } from "./blackBall";

export class Room {
  constructor(game, roomId) {
    this.utils = utils;
    this.game = game;
    this.roomId = roomId;
    this.floorLevel = -1;
    this.elevatorLeft = 0;
    this.elevatorRight = 0;
    this.furnitureItems = [];
    this.terminalItems = [];
    this.liftGroups = [];
    this.blackBallEnemy = false;
  }

  init() {
    this.setupRoomConnections();
    this.setupFurnitureItems();
    this.setupTerminalItems();
    this.setupBlackBallEnemies();
  }

  setupRoomConnections() {
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

        break;
      }
    }
  }

  setupFurnitureItems() {
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

  setupTerminalItems() {
    for (var j = 0; j < roomTerminalItems[this.roomId].length; j++) {
      var item = roomTerminalItems[this.roomId][j];

      this.terminalItems[j] = new Terminal(this.roomId, item.l, item.b);
      this.terminalItems[j].init();
    }
  }

  setupInnerLiftItems() {
    for (var j = 0; j < innerLiftItems[this.roomId].length; j++) {
      var item = innerLiftItems[this.roomId][j];

      this.liftGroups[j] = new InnerLift(this.roomId, item.l);
      this.liftGroups[j].init();
    }
  }

  setupBlackBallEnemies() {
    if (blackBallEnemies[this.roomId]) {
      this.blackBallEnemy = new BlackBall(this.roomId);
      this.blackBallEnemy.init();
    }
  }
}
