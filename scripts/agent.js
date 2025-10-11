import { utils } from "./utils";
import { keyboard } from "./keyboard";

export class Agent {
  constructor() {
    this.utils = utils;
    this.game = null;

    // The horizontal position is x and the vertical position is y.
    // These are both measured in pixels.
    this.x = 140;
    this.y = 45;

    this.direction = "left";
    this.action = "stand";
  }

  init(game) {
    this.game = game;

    this.graphics = {
      left: {
        stand: [{ x: 35, y: 503 }],
      },
      right: {
        stand: [{ x: 0, y: 503 }],
      },
    };
  }

  animationRoutine() {
    if (this.action == "stand") {
      let g = this.graphics[this.direction]["stand"][0];
      this.utils.draw(g.x, g.y, 35, 41, this.x, this.y);
    }
  }

  scanRoutine() {
    if (this.game.scene == "elevator") {
      if (this.utils.getSFC() % 2) return;
      if (this.game.pocketComputer.state != "map") return;

      let buttonLeft = keyboard.isKeyPressed(keyboard.keys.LEFT);
      let buttonRight = keyboard.isKeyPressed(keyboard.keys.RIGHT);

      if (buttonLeft && buttonRight) {
        this.stand();
      }

      if (buttonLeft && !buttonRight) {
        this.direction = "left";
      }

      if (buttonRight && !buttonLeft) {
        this.direction = "right";
      }

      if (!buttonLeft && !buttonRight) {
        this.stand();
      }
    }
  }

  stand() {
    this.action = "stand";
  }
}
