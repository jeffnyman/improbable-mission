import { logOnce } from "../utils/logger";

class Agent {
  animationRoutine() {
    logOnce("Display agent ..."); // REMOVE
  }
}

export const agent: Agent = new Agent();
