import { checkBrowserCapabilities } from "./utils/browserCheck";

export class App {
  constructor() {
    console.log("App Constructor");

    checkBrowserCapabilities();
  }
}
