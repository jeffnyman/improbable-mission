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
    const code = e.code;

    if (!this.pressedKeys[code]) {
      this.pressedKeys[code] = true;
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    const code = e.code;

    this.pressedKeys[code] = false;
  }

  setKeyState(code: string, state: boolean | string) {
    this.pressedKeys[code] = state;
  }
}

export const keyboard = new KeyboardManager();
