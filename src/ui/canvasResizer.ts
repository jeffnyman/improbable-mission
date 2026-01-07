import { browser } from "../utils/browser";
import { graphics } from "../utils/graphics";

class CanvasResizer {
  private canvas: HTMLCanvasElement | null = null;
  private aspectRatio = 16 / 10;
  private scaleFactor = 0.9;

  init() {
    this.canvas = graphics.getCanvas();
    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());
  }

  private handleResize() {
    if (!this.canvas) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const toolbar = browser.requireElement("toolbar");
    const toolbarHeight = toolbar.offsetHeight;
    const availableHeight = windowHeight - toolbarHeight;

    let newWidth, newHeight;

    if (windowWidth / availableHeight > this.aspectRatio) {
      // Window is wider than canvas aspect ratio; constrain by height.
      newHeight = availableHeight * this.scaleFactor;
      newWidth = Math.round(newHeight * this.aspectRatio);
    } else {
      // Window is taller than canvas aspect ratio; constrain by width.
      newWidth = windowWidth * this.scaleFactor;
      newHeight = Math.round(windowWidth * this.aspectRatio);
    }

    this.canvas.style.width = newWidth + "px";
    this.canvas.style.height = newHeight + "px";

    // Position the canvas centered, offset by half toolbar height.
    const offsetTop = `calc(50% + ${toolbarHeight / 2}px)`;
    this.canvas.style.top = offsetTop;
  }
}

export const canvasResizer: CanvasResizer = new CanvasResizer();
