export class KeyboardManager {
  constructor() {
    this.pressedKeys = [];
    this.keys = {
      UP: 38,
      DOWN: 40,
    };
  }
}

export const keyboard = new KeyboardManager();
