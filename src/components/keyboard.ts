export class KeyboardManager {
  private pressedKeys: Record<string, boolean | string> = {};

  public keys = {
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",
    SHIFT: "ShiftLeft",
  };

  init() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  isKeyPressed(code: string) {
    return this.pressedKeys[code] === true;
  }

  handleKeyDown(e: KeyboardEvent) {
    let code = e.code;

    if (
      code === "Space" ||
      code === "ControlLeft" ||
      code === "ControlRight" ||
      code === "ShiftLeft" ||
      code === "ShiftRight"
    ) {
      code = "ShiftLeft";
    }

    if (!this.pressedKeys[code]) {
      this.pressedKeys[code] = true;
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    let code = e.code;

    if (
      code === "Space" ||
      code === "ControlLeft" ||
      code === "ControlRight" ||
      code === "ShiftLeft" ||
      code === "ShiftRight"
    ) {
      code = "ShiftLeft";
    }

    this.pressedKeys[code] = false;
  }

  setKeyState(code: string, state: boolean | string) {
    this.pressedKeys[code] = state;
  }
}

export const keyboard = new KeyboardManager();
