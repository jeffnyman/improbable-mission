export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private roomId: number;

  // This is the elevator level, which can run from 1 to 6.
  // A value of -1 means no elevator level.
  private floorLevel = -1;

  constructor(roomId: number) {
    this.roomId = roomId;
  }

  init(mapRooms: Record<string, number[]>) {
    this.setupRoomConnections(mapRooms);
  }

  setupRoomConnections(mapRooms: Record<string, number[]>) {
    for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
      const column = mapRooms[columnIndex];
      const floorIndex = column.indexOf(this.roomId);

      if (floorIndex !== -1) {
        console.log(
          `Room ${this.roomId} is at column ${columnIndex}, floor ${floorIndex}`,
        ); // REMOVE

        this.floorLevel = floorIndex;

        break;
      }
    }
  }

  getFloorLevel() {
    return this.floorLevel;
  }
}
