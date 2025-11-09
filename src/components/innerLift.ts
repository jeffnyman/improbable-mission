import { graphics } from "../utils/graphics";

export class InnerLift {
  // @ts-expect-error - Am I going to need this?
  private roomId: number;

  // This is the left coordinate, from 0 to 39.
  private left: number;

  // This holds the actual lift positions in terms of
  // pixels (from the top).
  private lifts: number[] = [];

  // This is the vertical lift position coordinates,
  // which means the stations that it can stop at.
  private stops: number[] = [];

  constructor(roomId: number, left: number) {
    this.roomId = roomId;

    // The left coordinate of the lift; this value goes
    // from 0 to 39.
    this.left = left;
  }

  init(state: number[]) {
    for (const value of state) {
      this.stops.push(Math.abs(value));

      if (value > 0) {
        this.lifts.push(value * 8);
      }
    }
  }

  animationRoutine() {
    for (const liftPosition of this.lifts) {
      graphics.draw(344, 216, 24, 8, this.left * 8, liftPosition);
    }
  }
}
