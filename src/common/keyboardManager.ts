class KeyboardManager {
  private pressedKeys: Record<string, boolean | string> = {};
  private _keys = {
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",
    SHIFT: "ShiftLeft",
  } as const;

  constructor() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  get keys() {
    return this._keys;
  }

  setKeyState(code: string, state: boolean | string) {
    this.pressedKeys[code] = state;
  }

  isKeyPressed(code: string): boolean {
    return this.pressedKeys[code] === true;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if ((Object.values(this._keys) as readonly string[]).includes(e.code)) {
      e.preventDefault();
    }

    const code = this.normalizeKeyCode(e.code);
    this.pressedKeys[code] = true;
  }

  private handleKeyUp(e: KeyboardEvent) {
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
