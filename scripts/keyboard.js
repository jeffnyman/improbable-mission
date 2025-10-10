export class KeyboardManager {
  constructor() {
    this.pressedKeys = {};
    this.keys = {
      P: "KeyP",
      PAUSE: "Pause",
      ESC: "Escape",
      UP: "ArrowUp",
      DOWN: "ArrowDown",
    };
  }

  init() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  isKeyPressed(code) {
    return this.pressedKeys[code] === true;
  }

  handleKeyDown(e) {
    let code = e.code;
    console.log(`Key Down: ${code}`); // REMOVE

    if (!this.pressedKeys[code]) {
      this.pressedKeys[code] = true;
    }
  }

  handleKeyUp(e) {
    let code = e.code;
    console.log(`Key Up: ${code}`); // REMOVE

    this.pressedKeys[code] = false;
  }
}

export const keyboard = new KeyboardManager();
