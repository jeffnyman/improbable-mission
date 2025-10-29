export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private roomId: number;

  constructor(roomId: number) {
    this.roomId = roomId;
  }

  init() {
    this.setupRoomConnections();
  }

  setupRoomConnections() {
    console.log(`Room: ${this.roomId}`);
    // Need to iterate through the map here from the game
    // instance.
  }
}
