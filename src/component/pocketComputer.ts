import { audio } from "../common/audioManager";
import { cheats } from "../common/cheats";
import { game } from "../game";
import { elevator } from "./elevator";
import { graphics } from "../utils/graphics";
import { gameTime } from "../common/gameTime";
import { keyboard } from "../common/keyboardManager";
import { layoutManager } from "../common/layoutManager";
import type { Puzzle } from "./puzzle";
import {
  MAP_BORDER,
  MEMORY_RAIL_LEFT,
  MEMORY_RAIL_RIGHT,
  PHONE_BUTTONS,
  POCKET_COMPUTER_GLOVE,
  POCKET_COMPUTER_PANEL,
} from "../data/spriteRegions";

type PocketComputerState = "map" | "puzzles" | "phone";

/**
 * The agent's pocket computer, ported from the original
 * pocketComputer.js. Three screens: the elevator-system map, the
 * puzzle desktop (memory list, four working slots, flip/color/
 * bin/undo controls), and the phone (orientation correction and
 * solvability checks, each costing two minutes).
 */
class PocketComputer {
  // Holds the revealed, and thus by definition, the unrevealed
  // areas of elevator system. The full map will always be
  // unrevealed at the start. The one exception to this is the
  // first elevator on the first level, which is always revealed
  // immediately.
  // Structure: revealedMap[level][elevator] to match row-major
  // format of layout
  private revealedMap: number[][] = [];

  private state: PocketComputerState = "map";

  // The pocket computer stays hidden during the intro speech and
  // is revealed when the game hands off to the elevator scene.
  private visible = false;

  // Finger pointer position (in logical pixels).
  private pointerX = 248;
  private pointerY = 160;

  // Looping phone humming noise: false, true-ish (queued), or
  // "needToStart" after a call ends.
  private soundInLine: boolean | "needToStart" = false;

  // Active phone calls and their response messages.
  private dial1 = false;
  private dial2 = false;
  private dial1Message = "";
  private dial2Message = "";

  // Counters for score calculation.
  private foundedPieces = 0;
  private solvedPuzzles = 0;

  // Memory holds up to 36 puzzle pieces; the desktop holds four
  // working slots.
  private memory: (Puzzle | false)[] = [];
  private memoryIndex = 0;
  private desktop: (Puzzle | false)[] = [];
  private selectedDesktop: number | false = false;

  // A picked-up piece travels with the pointer; its origin is
  // "m1"/"m2" (memory rows) or "d0".."d3" (desktop slots).
  private grabbedPuzzle: Puzzle | false = false;
  private grabbedPuzzlePlace: string | false = false;

  // One-step undo for destructive desktop operations.
  private undoPuzzle: Puzzle | false = false;
  private undoPlace: number | false = false;

  // Warning message and its typewriter-wipe animation frame.
  private message: string | false = false;
  private messageFrame = 0;

  constructor() {
    // Initialize 6 levels, each with 9 elevator positions (0-8).
    // Note that there are only 8 distinct elevators.
    for (let level = 0; level < 6; level++) {
      this.revealedMap[level] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    // Reveal first elevator (index 0) on first level (index 0)
    this.revealedMap[0][0] = 1;

    for (let i = 0; i < 36; i++) this.memory[i] = false;
    for (let i = 0; i < 4; i++) this.desktop[i] = false;
  }

  getState() {
    return this.state;
  }

  setState(state: PocketComputerState) {
    this.state = state;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
  }

  isDialing() {
    return this.dial1 || this.dial2;
  }

  getFoundedPieces() {
    return this.foundedPieces;
  }

  getSolvedPuzzles() {
    return this.solvedPuzzles;
  }

  resetPointer() {
    this.pointerX = 248;
    this.pointerY = 160;
  }

  revealMapSection(elevatorNum: number, level: number) {
    this.revealedMap[level][elevatorNum] = 1;
  }

  /**
   * Files a found puzzle piece into the first free memory slot.
   */
  addPuzzle(puzzle: Puzzle) {
    this.foundedPieces++;

    for (let i = 0; i < 36; i++) {
      if (this.memory[i] === false) {
        this.memory[i] = puzzle;
        break;
      }
    }
  }

  /**
   * Whether all four pieces of a set are in memory.
   */
  puzzleSetIsSolvable(setId: number): boolean {
    let count = 0;

    for (const piece of this.memory) {
      if (piece && piece.getSet() === setId) count++;
    }

    return count === 4;
  }

  animationRoutine() {
    if (game.getTime().hour === 6) this.visible = false;
    if (!this.visible) return;

    // Draw the full computer interface at the bottom of the screen.
    graphics.drawSprite(POCKET_COMPUTER_PANEL, 0, 120);

    if (this.state === "map") {
      this.drawMapScreen();
    }

    if (this.state === "puzzles") {
      this.drawPuzzlesScreen();
    }

    if (this.state === "phone") {
      this.drawPhoneScreen();
    }
  }

  scanRoutine() {
    const actionLeft = keyboard.isKeyPressed(keyboard.keys.LEFT);
    const actionRight = keyboard.isKeyPressed(keyboard.keys.RIGHT);
    const actionUp = keyboard.isKeyPressed(keyboard.keys.UP);
    const actionDown = keyboard.isKeyPressed(keyboard.keys.DOWN);
    let actionFire = keyboard.isKeyPressed(keyboard.keys.SHIFT);

    // A pending message blocks everything until dismissed.
    if (this.message) {
      if (actionFire && this.messageFrame > 200) {
        keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
        this.message = false;
        game.setTimeSuspended(false);
      }

      return;
    }

    // Pointer movement limits per state; the map screen has no
    // pointer.
    let limitXMin = 0;
    let limitXMax = 0;
    let limitYMin = 0;
    let limitYMax = 0;

    if (this.state === "puzzles") {
      if (actionFire) {
        keyboard.setKeyState(keyboard.keys.SHIFT, "hold");

        if (this.grabbedPuzzle) {
          this.handlePuzzleDrop();
        } else {
          actionFire = this.handlePuzzlesClick();
        }
      }

      if (this.grabbedPuzzle) {
        limitXMin = 56;
        limitXMax = 176;
        limitYMin = 128;
        limitYMax = 152;
      } else {
        limitXMin = 2;
        limitXMax = 300;
        limitYMin = 126;
        limitYMax = 181;
      }
    } else if (this.state === "phone") {
      if (this.soundInLine === "needToStart") {
        this.soundInLine = audio.request({ name: "in.line", loop: true });
      }

      if (actionFire && !this.dial1 && !this.dial2) {
        keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
        this.handlePhoneClick();
      }

      limitXMin = 54;
      limitXMax = 54;
      limitYMin = 129;
      limitYMax = 190;
    } else {
      // The map screen has no pointer to move.
      return;
    }

    // Move the pointer (disabled mid-phone-call and while fire is
    // held for a click this frame).
    if (!actionFire) {
      if (this.state === "phone" && (this.dial1 || this.dial2)) return;

      if (actionLeft) {
        this.pointerX -= 3;
        if (this.pointerX < limitXMin) this.pointerX = limitXMin;
      } else if (actionRight) {
        this.pointerX += 3;
        if (this.pointerX > limitXMax) this.pointerX = limitXMax;
      }

      if (actionUp) {
        this.pointerY -= 2;
        if (this.pointerY < limitYMin) this.pointerY = limitYMin;
      } else if (actionDown) {
        this.pointerY += 2;
        if (this.pointerY > limitYMax) this.pointerY = limitYMax;
      }
    }
  }

  /**
   * Fire pressed while carrying a piece: put it back in memory or
   * drop it onto a desktop slot (merging if the slot is taken).
   */
  private handlePuzzleDrop() {
    const x = this.pointerX;
    const y = this.pointerY;

    if (!this.grabbedPuzzle) return;

    // Put back first puzzle to memory.
    if (
      this.grabbedPuzzlePlace === "m1" &&
      x >= 56 &&
      x <= 69 &&
      y >= 128 &&
      y <= 136
    ) {
      audio.request({ name: "beep4" });
      this.grabbedPuzzle = false;
      this.grabbedPuzzlePlace = false;
      this.pointerX = 82;
      this.pointerY = 139;
    }

    // Put back second puzzle to memory.
    if (
      this.grabbedPuzzlePlace === "m2" &&
      x >= 56 &&
      x <= 69 &&
      y >= 146 &&
      y <= 154
    ) {
      audio.request({ name: "beep4" });
      this.grabbedPuzzle = false;
      this.grabbedPuzzlePlace = false;
      this.pointerX = 82;
      this.pointerY = 163;
    }

    // Put to desktop places (unless it was just put back into
    // memory above).
    const grabbed = this.grabbedPuzzle;
    if (!grabbed) return;

    for (let i = 0; i < 4; i++) {
      const x1 = i % 2 ? 170 : 114;
      const x2 = i % 2 ? 192 : 136;
      const y1 = i < 2 ? 126 : 147;
      const y2 = i < 2 ? 138 : 158;

      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        const target = this.desktop[i];

        if (target && this.grabbedPuzzlePlace !== `d${i}`) {
          // This desktop place is reserved; try to merge.
          if (grabbed.getColor() !== target.getColor()) {
            this.setMessage("colors must match");
          } else if (target.overlap(grabbed, () => this.setUndo(i))) {
            // Overlap success.
            audio.request({ name: "beep4" });
            this.grabbedPuzzle = false;
            this.grabbedPuzzlePlace = false;
            this.selectedDesktop = i;
            this.pointerX = x2 + 10;
            this.pointerY = y2 + 2;

            if (target.isSolved()) this.solve(i);
          } else {
            this.setMessage("images can't overlap");
          }
        } else {
          // This desktop place is empty; put the grabbed puzzle.
          this.eraseUndo();
          audio.request({ name: "beep4" });
          this.desktop[i] = grabbed.clone();
          this.grabbedPuzzle = false;
          this.grabbedPuzzlePlace = false;
          this.selectedDesktop = i;
          this.pointerX = x2 + 10;
          this.pointerY = y2 + 2;
        }
      }
    }
  }

  /**
   * Fire pressed with an empty pointer on the puzzles screen: the
   * control buttons, memory list, and desktop selection.
   * Returns the (possibly consumed) fire state — opening the
   * phone eats the press.
   */
  private handlePuzzlesClick(): boolean {
    const x = this.pointerX;
    const y = this.pointerY;

    // Vertical invert button.
    if (x >= 238 && x <= 259 && y >= 125 && y <= 147) {
      this.flipSelected("vertical");
    }

    // Horizontal invert button.
    if (x >= 262 && x <= 283 && y >= 125 && y <= 147) {
      this.flipSelected("horizontal");
    }

    // Bin button.
    if (x >= 286 && x <= 307 && y >= 125 && y <= 147) {
      if (this.selectedDesktop === false) {
        this.setMessage("no image selected");
      } else {
        audio.request({ name: "beep5" });
        this.setUndo(this.selectedDesktop);
        this.desktop[this.selectedDesktop] = false;
        this.shiftDesktopSelection();
      }
    }

    // OFF button.
    if (x >= 238 && x <= 259 && y >= 149 && y <= 171) {
      this.eraseUndo();
      this.state = "map";
      keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
      audio.request({ name: "beep5" });
    }

    // Undo button.
    if (x >= 262 && x <= 283 && y >= 149 && y <= 171) {
      if (this.undoPuzzle === false) {
        this.setMessage("can't undo");
      } else {
        audio.request({ name: "beep5" });
        this.desktop[this.undoPlace as number] = this.undoPuzzle.clone();
        this.selectedDesktop = this.undoPlace as number;
        this.eraseUndo();
      }
    }

    // Pause button.
    if (x >= 286 && x <= 307 && y >= 149 && y <= 171) {
      game.setTimeSuspended(true);
      this.setMessage("time is suspended");
    }

    // Color change buttons.
    for (let i = 0; i < 3; i++) {
      const color = [5, 7, 3][i];
      const x1 = [238, 262, 286][i];
      const x2 = [259, 283, 307][i];

      if (x >= x1 && x <= x2 && y >= 173 && y <= 195) {
        if (this.selectedDesktop === false) {
          this.setMessage("no image selected");
        } else {
          audio.request({ name: "beep5" });
          const piece = this.desktop[this.selectedDesktop] as Puzzle;
          piece.setColor(color);
          piece.generateImage();

          for (const overlapPiece of piece.getOverlapPuzzles()) {
            overlapPiece.setColor(color);
            overlapPiece.generateImage();
          }
        }
      }
    }

    // Memory scroll up button.
    if (x >= 10 && x <= 35 && y >= 125 && y <= 144) {
      this.memoryIndex++;
      if (!this.memory[this.memoryIndex + 1]) {
        this.memoryIndex--;
        this.setMessage("end of memory");
      }
    }

    // Memory scroll down button.
    if (x >= 10 && x <= 35 && y >= 149 && y <= 169) {
      this.memoryIndex--;
      if (this.memoryIndex < 0) {
        this.memoryIndex = 0;
        this.setMessage("end of memory");
      }
    }

    // Phone button.
    if (x >= 10 && x <= 35 && y >= 173 && y <= 191) {
      this.pointerX = 54;
      this.pointerY = 190;
      this.state = "phone";
      keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
      this.soundInLine = audio.request({ name: "in.line", loop: true });
      return false;
    }

    // Pick up first puzzle from memory.
    if (
      this.memory[this.memoryIndex] &&
      x >= 56 &&
      x <= 103 &&
      y >= 128 &&
      y <= 148
    ) {
      audio.request({ name: "beep3" });
      this.grabbedPuzzle = (this.memory[this.memoryIndex] as Puzzle).clone();
      this.grabbedPuzzlePlace = "m1";
      this.pointerX = 60;
      this.pointerY = 130;
    }

    // Pick up second puzzle from memory.
    if (
      this.memory[this.memoryIndex + 1] &&
      x >= 56 &&
      x <= 103 &&
      y >= 152 &&
      y <= 172
    ) {
      audio.request({ name: "beep3" });
      this.grabbedPuzzle = (
        this.memory[this.memoryIndex + 1] as Puzzle
      ).clone();
      this.grabbedPuzzlePlace = "m2";
      this.pointerX = 60;
      this.pointerY = 154;
    }

    // Click on desktop: change puzzle selection or pick up puzzle.
    for (let i = 0; i < 4; i++) {
      const x1 = i % 2 ? 176 : 120;
      const x2 = i % 2 ? 223 : 167;
      const y1 = i < 2 ? 128 : 152;
      const y2 = i < 2 ? 148 : 172;

      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        if (this.selectedDesktop === i) {
          // Already selected: pick up this puzzle.
          this.eraseUndo();
          audio.request({ name: "beep3" });
          this.grabbedPuzzle = (this.desktop[i] as Puzzle).clone();
          this.grabbedPuzzlePlace = `d${i}`;
          this.pointerX = x1 + 4;
          this.pointerY = y1 + 2;
        } else if (!this.desktop[i]) {
          // Empty slot: nothing to select.
          audio.request({ name: "beep1" });
        } else {
          // Select this slot.
          this.eraseUndo();
          audio.request({ name: "beep2" });
          this.selectedDesktop = i;
        }
      }
    }

    return true;
  }

  private flipSelected(axis: "vertical" | "horizontal") {
    if (this.selectedDesktop === false) {
      this.setMessage("no image selected");
      return;
    }

    audio.request({ name: "beep5" });
    const piece = this.desktop[this.selectedDesktop] as Puzzle;

    if (axis === "vertical") {
      piece.setFlipV(!piece.getFlipV());
    } else {
      piece.setFlipH(!piece.getFlipH());
    }
    piece.generateImage();

    // Flip merged pieces too.
    for (const overlapPiece of piece.getOverlapPuzzles()) {
      if (axis === "vertical") {
        overlapPiece.setFlipV(!overlapPiece.getFlipV());
      } else {
        overlapPiece.setFlipH(!overlapPiece.getFlipH());
      }
      overlapPiece.generateImage();
    }

    if (piece.isSolved()) this.solve(this.selectedDesktop);
  }

  /**
   * The phone's three buttons. Each call takes several seconds
   * and charges a two-minute penalty when it completes.
   */
  private handlePhoneClick() {
    const x = this.pointerX;
    const y = this.pointerY;

    this.eraseUndo();

    // Dial 1: correct the orientations of the two visible memory
    // pieces.
    if (x >= 48 && x <= 61 && y >= 128 && y <= 143) {
      this.stopInLine();
      this.dial1 = true;
      audio.request({ name: "dial1" });

      setTimeout(() => {
        if (!this.memory[this.memoryIndex]) {
          this.dial1Message = "nothing in memory";
        } else {
          const first = this.memory[this.memoryIndex];
          if (first) first.fixOrientation();
          const second = this.memory[this.memoryIndex + 1];
          if (second) second.fixOrientation();

          this.dial1Message = "orientation corrected";
        }

        setTimeout(() => {
          this.soundInLine = "needToStart";
          this.dial1Message = "";
          this.dial1 = false;
          game.increaseTime("2m");
        }, 1700);
      }, 4600);
    }

    // Dial 2: is the upper-left puzzle's set solvable with the
    // pieces in memory?
    if (x >= 48 && x <= 61 && y >= 152 && y <= 175) {
      this.stopInLine();
      this.dial2 = true;
      audio.request({ name: "dial2" });

      setTimeout(() => {
        const piece = this.memory[this.memoryIndex];

        if (!piece) {
          this.dial2Message = "nothing in memory";
        } else if (this.puzzleSetIsSolvable(piece.getSet())) {
          this.dial2Message = "a solution exists.";
        } else {
          this.dial2Message = "need more pieces.";
        }

        setTimeout(() => {
          this.soundInLine = "needToStart";
          this.dial2Message = "";
          this.dial2 = false;
          game.increaseTime("2m");
        }, 1700);
      }, 5300);
    }

    // Hang up.
    if (x >= 48 && x <= 61 && y >= 184 && y <= 191) {
      this.stopInLine();
      this.state = "puzzles";
      keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
      this.resetPointer();
    }
  }

  private stopInLine() {
    if (this.soundInLine) {
      audio.stopAllSounds();
      this.soundInLine = false;
    }
  }

  private setMessage(message: string) {
    keyboard.setKeyState(keyboard.keys.SHIFT, "hold");
    audio.request({ name: "beep1" });
    this.message = message;
    this.messageFrame = 0;
  }

  /**
   * A desktop puzzle reached its solved state: bank the score,
   * clear the set from memory, and fill in a password letter.
   */
  private solve(i: number) {
    this.solvedPuzzles++;
    const set = (this.desktop[i] as Puzzle).getSet();

    // Remove the set's four pieces from memory.
    const newMemory: (Puzzle | false)[] = [];
    for (let j = 0; j < 36; j++) newMemory[j] = false;
    for (let j = 0, k = 0; j < 36; j++) {
      const piece = this.memory[j];
      if (piece && piece.getSet() !== set) newMemory[k++] = piece;
    }
    this.memory = newMemory;
    this.memoryIndex = 0;

    // Four celebratory beeps.
    audio.request({ name: "beep5", offset: 400 });
    audio.request({ name: "beep5", offset: 400 * 2 });
    audio.request({ name: "beep5", offset: 400 * 3 });
    audio.request({ name: "beep5", offset: 400 * 4 });

    // Add a letter to the password.
    game.solvePasswordLetter(set);

    // Remove the puzzle from the desktop.
    this.desktop[i] = false;
    this.selectedDesktop = false;
    this.shiftDesktopSelection();
  }

  private shiftDesktopSelection() {
    const current = this.selectedDesktop === false ? 0 : this.selectedDesktop;
    let found = false;

    for (let i = 1; i <= 4; i++) {
      let next = current + i;
      if (next > 3) next = next - 4;

      if (this.desktop[next]) {
        this.selectedDesktop = next;
        found = true;
        break;
      }
    }

    if (!found) this.selectedDesktop = false;
  }

  private eraseUndo() {
    this.undoPuzzle = false;
    this.undoPlace = false;
  }

  private setUndo(place: number) {
    const piece = this.desktop[place];
    if (piece) {
      this.undoPuzzle = piece.clone();
      this.undoPlace = place;
    }
  }

  private drawPuzzlesScreen() {
    // Memory container rails.
    graphics.drawSprite(MEMORY_RAIL_LEFT, 49, 128);
    graphics.drawSprite(MEMORY_RAIL_RIGHT, 106, 128);

    // The two visible memory rows.
    for (let i = this.memoryIndex, j = 0; i < this.memoryIndex + 2; i++, j++) {
      const piece = this.memory[i];
      if (!piece) continue;
      piece.draw(56, 128 + j * 24);
      if (piece.hasCorrectOrientation()) {
        graphics.rect(49, 132 + j * 20, 5, 16, 10);
      }
    }

    // Desktop slots.
    for (let i = 0; i < 4; i++) {
      const piece = this.desktop[i];
      if (!piece) continue;
      const x = i % 2 ? 176 : 120;
      const y = i < 2 ? 128 : 152;
      piece.draw(x, y);
    }

    // Selection highlight.
    if (this.selectedDesktop === 0) {
      graphics.rect(124, 149, 48, 2, 8);
      graphics.rect(168, 130, 4, 19, 8);
    }
    if (this.selectedDesktop === 1) {
      graphics.rect(180, 149, 48, 2, 8);
      graphics.rect(224, 130, 4, 19, 8);
    }
    if (this.selectedDesktop === 2) {
      graphics.rect(124, 173, 48, 2, 8);
      graphics.rect(168, 154, 4, 19, 8);
    }
    if (this.selectedDesktop === 3) {
      graphics.rect(180, 173, 48, 2, 8);
      graphics.rect(224, 154, 4, 19, 8);
    }

    // Text info: a pending message, or the status line.
    if (this.message) {
      if (this.message === "no image selected")
        graphics.text(this.message, 73, 183, 7);
      if (this.message === "can't undo") graphics.text(this.message, 97, 183, 7);
      if (this.message === "end of memory")
        graphics.text(this.message, 89, 183, 7);
      if (this.message === "colors must match")
        graphics.text(this.message, 73, 183, 7);
      if (this.message === "images can't overlap")
        graphics.text(this.message, 58, 183, 7);
      if (this.message === "time is suspended")
        graphics.text(this.message, 73, 183, 7);

      graphics.text("(push button)", 89, 191, 1);

      // Typewriter wipe: the message is revealed left to right.
      this.messageFrame += 15;
      const rectPos = Math.min(47 + this.messageFrame, 47 + 181);
      graphics.rect(rectPos, 175, 45 + 182 - rectPos, 18, 0);
    } else {
      const time = game.getTime();
      graphics.text("snoozes:", 48, 183, 4);
      graphics.text(game.getSnoozes(), 112, 183, 7);
      graphics.text("lift inits:", 128, 183, 4);
      graphics.text(game.getLiftInits(), 216, 183, 7);
      graphics.text("psw:", 48, 191, 5);
      graphics.text(game.getSolvedPassword(), 80, 191, 1);
      graphics.text(
        `${time.hour}:${time.minuteString}:${time.secondString}`,
        time.hour < 10 ? 168 : 160,
        191,
        3,
      );
    }

    // The pointer: a carried puzzle piece, or the finger.
    if (this.grabbedPuzzle) {
      this.grabbedPuzzle.draw(this.pointerX, this.pointerY);
    } else {
      graphics.drawSprite(POCKET_COMPUTER_GLOVE, this.pointerX, this.pointerY);
    }
  }

  private drawPhoneScreen() {
    // Phone buttons.
    graphics.drawSprite(PHONE_BUTTONS, 48, 128);

    // Texts.
    graphics.text("correct orientations", 64, 135, 3);
    graphics.text("of leftmost pieces.", 64, 143, 3);
    graphics.text("we have enough", 64, 159, 4);
    graphics.text("pieces to solve the", 64, 167, 4);
    graphics.text("upper left puzzle?", 64, 175, 4);
    graphics.text("hang up.", 64, 191, 7);

    if (this.dial1 && this.dial1Message) {
      if (this.dial1Message === "nothing in memory")
        graphics.text(this.dial1Message, 80, 183, 1);
      if (this.dial1Message === "orientation corrected")
        graphics.text(this.dial1Message, 56, 183, 1);
    }

    if (this.dial2 && this.dial2Message) {
      if (this.dial2Message === "nothing in memory")
        graphics.text(this.dial2Message, 80, 183, 1);
      if (this.dial2Message === "need more pieces.")
        graphics.text(this.dial2Message, 80, 183, 1);
      if (this.dial2Message === "a solution exists.")
        graphics.text(this.dial2Message, 80, 183, 1);
    }

    // Draw the finger pointer.
    graphics.drawSprite(POCKET_COMPUTER_GLOVE, this.pointerX, this.pointerY);
  }

  private drawMapScreen() {
    // Draw the map border.
    graphics.drawSprite(MAP_BORDER, 58, 131);

    // Establish the map view boundary.
    graphics.rect(64, 136, 152, 48, 5);

    // Keeping in mind the room layout as it is in the
    // row-major format, this will iterate through the
    // nine elevator shafts and the six levels.
    const rooms = game.getMap().rooms;

    // The XRAY cheat displays everything without touching the
    // real exploration state.
    const xray = cheats.isXray();

    for (let elevatorNum = 1; elevatorNum <= 9; elevatorNum++) {
      for (let level = 0; level < 6; level++) {
        // Only draw the elevator shaft line if this section has
        // been revealed.
        if (xray || this.revealedMap[level][elevatorNum - 1] === 1) {
          graphics.rect(83 + (elevatorNum - 1) * 16, 136 + level * 8, 2, 8, 0);

          // Is there a left room? (room to the left of this elevator)
          const leftRoomId = elevatorNum > 0 ? rooms[level][elevatorNum - 1] : 0;

          if (leftRoomId) {
            if (layoutManager.hasRightDoor(leftRoomId) === 2) {
              // Draw the right top corridor.
              graphics.rect(80 + (elevatorNum - 1) * 16, 137 + level * 8, 3, 1, 0);
            } else if (layoutManager.hasRightDoor(leftRoomId) === 3) {
              // Draw the right bottom corridor.
              graphics.rect(80 + (elevatorNum - 1) * 16, 141 + level * 8, 3, 1, 0);
            }

            // Check if the room is revealed.
            // Draw room indicator to the LEFT of the elevator shaft.
            if (
              layoutManager.hasRightDoor(leftRoomId) &&
              (xray || game.getRoom(leftRoomId).isRevealed())
            ) {
              graphics.rect(72 + (elevatorNum - 1) * 16, 137 + level * 8, 8, 5, 0);
            }
          }

          // Is there a right room? (room to the right of this elevator)
          const rightRoomId = elevatorNum < 9 ? rooms[level][elevatorNum] : 0;

          if (rightRoomId) {
            if (layoutManager.hasLeftDoor(rightRoomId) === 1) {
              // Draw the left top corridor.
              graphics.rect(85 + (elevatorNum - 1) * 16, 137 + level * 8, 3, 1, 0);
            } else if (layoutManager.hasLeftDoor(rightRoomId) === 4) {
              // Draw the left bottom corridor.
              graphics.rect(85 + (elevatorNum - 1) * 16, 141 + level * 8, 3, 1, 0);
            }

            // Check if the room is revealed.
            // Draw room indicator to the RIGHT of the elevator shaft.
            if (
              layoutManager.hasLeftDoor(rightRoomId) &&
              (xray || game.getRoom(rightRoomId).isRevealed())
            ) {
              graphics.rect(88 + (elevatorNum - 1) * 16, 137 + level * 8, 8, 5, 0);
            }
          }
        }
      }
    }

    // Draw the elevator point.
    graphics.rect(
      83 + (elevator.getCurrentPosition().x - 1) * 16,
      136 + Math.floor(elevator.getCurrentPosition().y / 53),
      2,
      3,
      [0, 11, 12, 15, 1, 15, 12, 11][Math.floor((gameTime.getAFC() % 24) / 3)],
    );
  }
}

export const pocketComputer: PocketComputer = new PocketComputer();
