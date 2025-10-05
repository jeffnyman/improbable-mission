export class InnerLift {
  constructor(roomId, left) {
    this.roomId = roomId;
    this.left = left;

    // This is the vertical lift position coordinates,
    // which means the stations.
    this.stops = [];

    // This refers to the actual lift positions but in
    // pixels (top).
    this.lifts = [];

    this.originalState = null;
  }

  init(state) {
    for (var i = 0; i < state.length; i++) {
      this.stops.push(Math.abs(state[i]));

      if (state[i] > 0) {
        this.lifts.push(state[i] * 8);
      }
    }
  }
}
