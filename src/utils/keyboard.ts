export class KeyboardManager {
  private pressedKeys: Record<string, boolean> = {};

  public keys = {
    UP: "ArrowUp",
    DOWN: "ArrowDown",
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

    this.pressedKeys[e.code] = true;
  }

  handleKeyUp(e: KeyboardEvent) {
    this.pressedKeys[e.code] = false;
  }
}

export const keyboard: KeyboardManager = new KeyboardManager();
