import { checkBrowserCapabilities } from "./utils/browserCheck";
import { Coordinator } from "./coordinator";

export class App {
  constructor() {
    console.log("App Constructor");

    checkBrowserCapabilities();

    const coordinator = new Coordinator();
    coordinator.start();
  }
}
