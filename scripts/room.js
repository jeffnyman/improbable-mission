export class Room {
  constructor(game, roomId) {
    this.game = game;
    this.roomId = roomId;
  }

  init() {
    for (var i = 0; i < 9; i++) {
      var column = this.game.map.rooms[i];
      var row = column.indexOf(this.roomId);

      if (row !== -1) {
        console.log(`Room ${this.roomId}: Found at column ${i}, row ${row}`); // REMOVE
        break;
      }
    }
  }
}
