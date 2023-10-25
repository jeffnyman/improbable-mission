import { ResourceLoader } from "./utils/resourceLoader";

export class Coordinator {
  constructor() {
    console.log("Coordinator Constructed");
  }

  start() {
    console.log("|| Coordinator Started ||");

    new ResourceLoader();
  }
}
