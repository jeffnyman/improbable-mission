import { logOnce } from "./utils/logger";

class Game {
  updateAnimation() {
    logOnce("In animation loop ..."); // TEMPORARY
  }
}

export const game: Game = new Game();
