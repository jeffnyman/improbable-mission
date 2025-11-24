import { browser } from "../utils/browser";
import { graphics } from "../utils/graphics";

export class CanvasResizer {
  private canvas: HTMLCanvasElement;
  private scaleFactor = 0.9;
  private aspectRatio = 16 / 10;

  constructor() {
    this.canvas = graphics.getCanvas();
  }

  init() {
    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());
  }

  private handleResize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const toolbar = browser.requireElement("toolbar");
    const toolbarHeight = toolbar.offsetHeight;
    const availableHeight = windowHeight - toolbarHeight;

    let newWidth, newHeight;

    if (windowWidth / availableHeight > this.aspectRatio) {
      // Window is wider than canvas aspect ratio; constrain by height.
      newHeight = availableHeight * this.scaleFactor;
      newWidth = Math.round((availableHeight / 10) * 16);
    } else {
      // Window is taller than canvas aspect ratio; constrain by width.
      newWidth = windowWidth * this.scaleFactor;
      newHeight = Math.round((windowWidth * 10) / 16);
    }

    this.canvas.style.width = newWidth + "px";
    this.canvas.style.height = newHeight + "px";

    // Position canvas centered, offset by half toolbar height.
    const offsetTop = `calc(50% + ${toolbarHeight / 2}px)`;
    this.canvas.style.top = offsetTop;
  }
}
