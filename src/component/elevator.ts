import { logOnce } from "../utils/logger";

class Elevator {
  animationRoutine() {
    logOnce("In animation loop ..."); // TEMPORARY
  }
}

export const elevator: Elevator = new Elevator();
