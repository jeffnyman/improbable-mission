import { keyboard } from "../components/keyboard";

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
