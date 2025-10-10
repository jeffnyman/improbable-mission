import { utils } from "./utils";

export class Agent {
  constructor() {
    this.utils = utils;

    // The horizontal position is x and the vertical position is y.
    // These are both measured in pixels.
    this.x = 140;
    this.y = 45;

    this.direction = "left";
    this.action = "stand";
  }

  init() {
    this.graphics = {
      left: {
        stand: [{ x: 35, y: 503 }],
      },
    };
  }

  animationRoutine() {
    if (this.action == "stand") {
      let g = this.graphics[this.direction]["stand"][0];
      this.utils.draw(g.x, g.y, 35, 41, this.x, this.y);
    }
  }
}
