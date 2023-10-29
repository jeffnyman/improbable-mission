import { ResourceLoader } from "./utils/resourceLoader";
import { Layout } from "./layout";

export class Coordinator {
  layout: Layout;

  constructor() {
    console.log("Coordinator Constructed");

    this.layout = new Layout();
  }

  start() {
    console.log("|| Coordinator Started ||");

    const resources = new ResourceLoader();

    resources
      .load()
      .then(() => {
        console.log("Loading completed.");
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
