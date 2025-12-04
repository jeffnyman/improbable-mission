export class KeyboardManager {
  private pressedKeys: Record<string, boolean> = {};

  public keys = {
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",
    SHIFT: "ShiftLeft",
  };

  constructor() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  isKeyPressed(code: string) {
    return this.pressedKeys[code] === true;
  }

  handleKeyDown(e: KeyboardEvent) {
    if (Object.values(this.keys).includes(e.code)) {
      e.preventDefault();
    }

    const code = this.normalizeKeyCode(e.code);
    this.pressedKeys[code] = true;
  }

  handleKeyUp(e: KeyboardEvent) {
    const code = this.normalizeKeyCode(e.code);
    this.pressedKeys[code] = false;
  }

  private normalizeKeyCode(code: string): string {
    if (
      code === "Space" ||
      code === "ControlLeft" ||
      code === "ControlRight" ||
      code === "ShiftLeft" ||
      code === "ShiftRight"
    ) {
      return "ShiftLeft";
    }
    return code;
  }
}

export const keyboard: KeyboardManager = new KeyboardManager();
