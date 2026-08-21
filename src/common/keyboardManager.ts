/**
 * The game is played on a C64 joystick: four directions and one fire
 * button. This class is the adapter, and it does two things that are
 * worth knowing before reading any input code.
 *
 * First, several real keys collapse into one logical key — see
 * normalizeKeyCode. Second, a key can be in three states rather than
 * two, which is what the string half of the value type is for.
 */
class KeyboardManager {
  /**
   * Key state, where a key is either up (false/absent), down (true),
   * or latched to "hold".
   *
   * A latched key reads as *not pressed* through isKeyPressed, because
   * that method tests for true exactly. Game code latches a key to
   * consume a press so that simply holding it cannot repeat the
   * action: a jump, a lifting platform stopping at a station, a
   * terminal menu selection, a pocket computer button. The player has
   * to release and press again, and only a real keyup clears it.
   */
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

    // A key latched to "hold" must stay held until a real keyup;
    // OS auto-repeat fires keydown events that must not clear the
    // latch (the original guards this the same way). Without this,
    // lifts blow through stations and chain-jump latching breaks.
    if (this.pressedKeys[code] !== "hold") {
      this.pressedKeys[code] = true;
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    const code = this.normalizeKeyCode(e.code);
    this.pressedKeys[code] = false;
  }

  /**
   * Folds every key that acts as the joystick's fire button onto one
   * code, so the rest of the game only ever asks about SHIFT.
   *
   * The manual offers Shift, Space or Ctrl because the original did,
   * and all six of these keys are the same button: somersault in the
   * rooms, and the pocket computer switch in an elevator. "ShiftLeft"
   * is simply the name the fire button goes by internally, which is
   * why a press of Space is recorded under it.
   */
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
