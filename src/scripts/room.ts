export class Room {
  map: { rooms: Record<number, number[]> };

  constructor(map: { rooms: Record<number, number[]> }) {
    console.log("Room Constructed");

    // Contains the map layout that was chosen.
    this.map = map;
  }

  setup() {
    console.log("| Setup room |"); // DEBUG

    // NOTE: The 1 should be 9 for the final version.
    for (var i = 0; i < 1; i++) {
      var roomsInShaft = this.map.rooms[i];
      console.log(`ROOMS IN SHAFT: ${roomsInShaft}`);
    }
  }
}
