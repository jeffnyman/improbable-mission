import { layouts } from "./layout";

export class Game {
  constructor() {
    this.layoutId = 0;
    this.layout = layouts[this.layoutId].rooms;

    console.log(`Layout ID: ${this.layoutId}`); // REMOVE
    console.log(`Layout: ${JSON.stringify(this.layout)}`); // REMOVE
  }

  init() {}
}
