export class InnerLift {
  constructor(roomId, left) {
    this.roomId = roomId;

    // The left coordinate goes from 0 to 39.
    this.left = left;

    // This is the vertical lift position coordinates,
    // which means the stations that it can stop at.
    this.stops = [];

    // This refers to the actual lift positions but in
    // pixels (top).
    this.lifts = [];

    // This is needed for being able to reset the lift.
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
