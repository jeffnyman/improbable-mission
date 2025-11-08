import { keyboard } from "../components/keyboard";
import { palette } from "../data/palette";

class CommonUtils {
  private animationFrameCounter = 0;
  private scanFrameCounter = 0;

  setAnimationFrameCounter(counter: number) {
    this.animationFrameCounter = counter;
  }

  getAFC() {
    return this.animationFrameCounter;
  }

  setScanFrameCounter(counter: number) {
    this.scanFrameCounter = counter;
  }

  getSFC() {
    return this.scanFrameCounter;
  }

  fire() {
    return keyboard.isKeyPressed(keyboard.keys.SHIFT);
  }

  holdFire() {
    keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
  }

  getColorIndex(r: number, g: number, b: number): number | false {
    for (let j = 0; j < palette.source.length; j++) {
      const c = palette.source[j];
      const sr = parseInt(c[0] + c[1], 16);
      const sg = parseInt(c[2] + c[3], 16);
      const sb = parseInt(c[4] + c[5], 16);

      if (r == sr && g == sg && b == sb) return j;
    }

    return false;
  }

  setInterfaceText(id: string, text: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  showError(message: string) {
    console.log(message);
    document.getElementById("loading")?.classList.add("hidden");

    const errorDiv = document.getElementById("error");

    if (errorDiv) {
      const abortedContainer = errorDiv.querySelector(".aborted-container");

      if (abortedContainer) {
        this.setInterfaceText("message", `Mission Aborted: ${message}`);
      }

      errorDiv.classList.remove("hidden");
    }
  }
}

export const utils: CommonUtils = new CommonUtils();
