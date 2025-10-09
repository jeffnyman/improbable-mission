import { utils } from "./utils";

export class Elevator {
  constructor() {
    this.utils = utils;
  }

  init() {}

  animationRoutine() {
    this.utils.rect(128, 0, 64, 200, 0);
    this.utils.draw(708, 16, 48, 96, 136, 0);
  }
}
