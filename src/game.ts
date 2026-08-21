import { agent } from "./component/agent";
import { elevator } from "./component/elevator";
import { gameTime } from "./common/gameTime";
import { sceneManager } from "./common/sceneManager";
import { pocketComputer } from "./component/pocketComputer";
import { layoutManager } from "./common/layoutManager";
import { Room } from "./component/room";
import { audio } from "./common/audioManager";
import { graphics } from "./utils/graphics";
import { maps, passwords } from "./data/layout";
import type { Terminal } from "./component/terminal";
import { cheats } from "./common/cheats";
import { keyboard } from "./common/keyboardManager";
import { log } from "./utils/logger";
import { rnd } from "./utils/common";
import {
  ELVIN_CONTROL_ROOM,
  ELVIN_FRAMES,
  SCORE_BOARD_FRAME,
} from "./data/spriteRegions";

class Game {
  private animationFrameCounter = 0;
  private scanFrameCounter = 0;
  private paused = false;

  // Guards the one-shot intro speech and its handoff timeout.
  private introStarted = false;

  // The mission clock: starts at 12:00:00 and counts up; the
  // mission fails when it reaches 6 o'clock (six hours later).
  // Ticks one game-second every 37 scan frames (~1 real second).
  private timeHour = 12;
  private timeMinute = 0;
  private timeSecond = 0;

  // The next clock hour at which Elvin taunts "destroy him" on
  // room entry (hours 1 through 5).
  private destroyHimNextHour = 1;

  // While positive, robots and the orb are snoozing. A terminal sets
  // it when the player spends a snooze password, the room scan counts
  // it down, and leaving the room clears it outright.
  private snoozeTime = 0;

  // While positive, the whole room scan is frozen (used for the
  // "destroy him" taunt pause).
  private skipScanFrames = 0;

  // Banked passwords from searching: snoozes disable robots via a
  // terminal, lift inits reset a room's lifting platforms.
  private snoozes = 0;
  private liftInits = 0;

  // Count of found snooze/lift-init passwords, for scoring.
  private passwordsFound = 0;

  // The tower password letters solved so far (9 characters,
  // spaces for unsolved positions).
  private solvedPassword = "         ";

  // The pocket computer's pause button suspends the clock until
  // the message is dismissed.
  private timeIsSuspended = false;

  // The terminal being used while in the terminal scene.
  private actualTerminal: Terminal | null = null;

  // Set when the agent enters Elvin's door with the password.
  private missionComplete = false;

  // Snapshot of the screen at the moment time ran out, for the
  // bomb animation.
  private gameOverImage: HTMLImageElement | null = null;

  // Frame counters for the endgame animations.
  private gameOverFrames = 0;
  private elvinFrames = 0;
  private elvinBackgroundDrawn = false;

  // The calculated final score, or null until the scores scene
  // computes it.
  private scoreData: {
    puzzlePiecesFound: number;
    puzzlePiecesFoundScore: number;
    passwordsFound: number;
    passwordsFoundScore: number;
    puzzlesSolved: number;
    puzzlesSolvedScore: number;
    secondsRemaining: number;
    totalScore: number;
    hallOfFamePosition: number | false;
  } | null = null;

  // Hall-of-fame name entry state.
  private hallOfFameName = "";
  private hallOfFameNameConfirmed = false;

  // The fifteen best scores, persisted in localStorage.
  private highScores: { score: number; name: string }[] = [];

  // All room instances indexed by room ID.
  private rooms: Record<number, Room> = {};

  // The room the agent is currently in.
  private room: Room | null = null;

  // The ID of the currently active room. This is set when the
  // agent enters a room from the elevator.
  private roomId: number;

  // The map layout defining which room IDs exist at each
  // coordinate, and its id (which selects the tower password).
  private map: { rooms: number[][] };
  private mapId: number;

  // The screen transition can be false (not happening), opening
  // (an "open" transition) or closing (a "close" transition).
  private transitionState: false | "close" | "open" = false;

  // The transition height can be a value from 0 to 100.
  private transitionHeight = 0;

  // Callback function to execute when the screen transition
  // completes e.g., entering or leaving a room). This is set
  // by startTransition().
  private transitionFunction?: () => void;

  constructor() {
    // Each new game plays a random one of the 11 layouts. A
    // ?map=N query parameter forces a specific layout for
    // development and testing (read here, before mission.ts
    // strips the query string from the URL).
    const requested = new URLSearchParams(window.location.search).get("map");
    const forced = requested === null ? NaN : Number(requested);

    this.mapId =
      Number.isInteger(forced) && forced >= 0 && forced < maps.length
        ? forced
        : rnd(maps.length) - 1;
    this.map = maps[this.mapId];

    // This is being done to make sure the roomId is set but
    // it's being set to an invalid value.
    this.roomId = -1;

    log(`map.id: ${this.mapId}`);
    log(`map.rooms: ${JSON.stringify(this.map.rooms)}`);
  }

  getMapId() {
    return this.mapId;
  }

  getSnoozeTime() {
    return this.snoozeTime;
  }

  getSkipScanFrames() {
    return this.skipScanFrames;
  }

  getSnoozes() {
    return this.snoozes;
  }

  setSnoozes(count: number) {
    this.snoozes = count;
  }

  getLiftInits() {
    return this.liftInits;
  }

  setLiftInits(count: number) {
    this.liftInits = count;
  }

  getPasswordsFound() {
    return this.passwordsFound;
  }

  incrementPasswordsFound() {
    this.passwordsFound++;
  }

  getSolvedPassword() {
    return this.solvedPassword;
  }

  /**
   * Fills in one letter of the tower password when a puzzle set
   * is solved. The password is indexed by this game's map id —
   * 0-based, so no off-by-one is possible.
   */
  solvePasswordLetter(set: number) {
    const letter = passwords[this.mapId][set];
    this.solvedPassword =
      this.solvedPassword.substring(0, set) +
      letter +
      this.solvedPassword.substring(set + 1);
  }

  isTimeSuspended() {
    return this.timeIsSuspended;
  }

  setTimeSuspended(suspended: boolean) {
    this.timeIsSuspended = suspended;
  }

  getActualTerminal() {
    return this.actualTerminal;
  }

  setActualTerminal(terminal: Terminal | null) {
    this.actualTerminal = terminal;
  }

  isMissionComplete() {
    return this.missionComplete;
  }

  /**
   * The agent opened Elvin's door with the full password: the endgame
   * begins and the elvin scene takes over both loops, where he stomps
   * and rages until the score board.
   */
  startElvinScene() {
    this.missionComplete = true;
    sceneManager.setScene("elvin");
  }

  setSnoozeTime(frames: number) {
    this.snoozeTime = frames;
  }

  getTime() {
    return {
      hour: this.timeHour,
      minute: this.timeMinute,
      second: this.timeSecond,
      minuteString: (this.timeMinute < 10 ? "0" : "") + this.timeMinute,
      secondString: (this.timeSecond < 10 ? "0" : "") + this.timeSecond,
    };
  }

  /**
   * Advances the mission clock: one second per tick, or a
   * minute-sized penalty ("2m" for failed puzzle checks, "10m"
   * for dying). The hour wraps 12 -> 1 like a real clock face.
   * The TIMELORD cheat freezes time itself — every advancement,
   * penalties included, becomes a no-op.
   */
  increaseTime(amount: "1s" | "2m" | "10m") {
    if (cheats.isTimeFrozen()) return;
    if (amount === "1s") {
      if (++this.timeSecond > 59) {
        this.timeSecond = 0;
        if (++this.timeMinute > 59) {
          this.timeMinute = 0;
          if (++this.timeHour > 12) this.timeHour = 1;
        }
      }
    } else {
      this.timeMinute += parseInt(amount, 10);
      if (this.timeMinute > 59) {
        this.timeMinute = this.timeMinute - 60;
        if (++this.timeHour > 12) this.timeHour = 1;
      }
    }
  }

  init() {
    // Rebuild the agent's pixel collision masks now that the
    // sprite sheet is loaded — the ones built at module import
    // were empty, and falling detection depends on them.
    agent.initializeCollisionMaps();

    this.generateRooms();
    this.placeItems();
    this.loadHighScores();
  }

  private loadHighScores() {
    try {
      const stored = localStorage.getItem("highScores");
      const parsed = stored ? JSON.parse(stored) : null;

      if (
        Array.isArray(parsed) &&
        parsed.length === 15 &&
        parsed.every(
          (entry) =>
            typeof entry?.score === "number" && typeof entry?.name === "string",
        )
      ) {
        this.highScores = parsed;
        return;
      }
    } catch {
      // Fall through to defaults on any parse problem.
    }

    this.highScores = Array.from({ length: 15 }, () => ({
      score: 0,
      name: "-----",
    }));
  }

  private saveHighScores() {
    try {
      localStorage.setItem("highScores", JSON.stringify(this.highScores));
    } catch {
      // Persistence is best-effort.
    }
  }

  getRoomId() {
    return this.roomId;
  }

  getMap() {
    return this.map;
  }

  getRoom(roomId: number) {
    return this.rooms[roomId];
  }

  updateScan() {
    // Increment the local frame counter and sync it to the global
    // gameTime singleton. This allows other components to query the
    // current frame without depending on Game.
    this.scanFrameCounter++;
    gameTime.setSFC(this.scanFrameCounter);

    // Clear audio queue from previous frame before processing
    // new requests.
    audio.emptyRequestQueue();

    // Tick the mission clock: one game-second every 37 scan
    // frames while actually playing (not during transitions or
    // other scenes).
    const activeScene = sceneManager.getScene();

    if (
      this.scanFrameCounter % 37 === 0 &&
      !this.transitionState &&
      (activeScene === "elevator" || activeScene === "room") &&
      !pocketComputer.isDialing() &&
      !this.timeIsSuspended
    ) {
      this.increaseTime("1s");
    }

    if (!this.transitionState) {
      switch (sceneManager.getScene()) {
        case "anotherVisitor":
          this.scanAnotherVisitor();
          break;

        case "elevator": {
          elevator.scanRoutine((direction) => {
            this.startTransition(() => {
              this.enterRoom(direction);
            });
          });

          // Reveal the map portion on the pocket computer. This
          // will show the level of the elevator system.
          const pos = elevator.getCurrentPosition();

          if (pos.y % 216 === 0) {
            const level = Math.floor(pos.y / 216 / 2);

            // Convert 1-indexed elevator position to 0-indexed
            // for the array.
            pocketComputer.revealMapSection(pos.x - 1, level);
          }

          // The agent is frozen while the elevator travels and
          // while the pocket computer is open, matching the
          // original's gating.
          if (!elevator.isMoving() && pocketComputer.getState() === "map") {
            agent.scanElevatorScene();
          }

          // The pocket computer itself (pointer movement, puzzle
          // desktop, phone) always scans in the elevator scene.
          pocketComputer.scanRoutine();
          break;
        }

        case "room":
          // A taunt (or similar) can freeze the whole room for a
          // number of frames.
          if (this.skipScanFrames > 0) {
            this.skipScanFrames--;
            break;
          }

          // Update all entities in the current room, which are
          // lifts, orbs, and robots.
          if (this.room) {
            this.room.scanRoutine(agent);
          }

          agent.scanRoomScene((direction) => {
            this.startTransition(() => {
              this.leaveRoom(direction);
            });
          });
          break;

        case "terminal":
          this.actualTerminal?.sceneScanRoutine();
          break;

        case "gameOver":
          this.scanGameOver();
          break;

        case "scores":
          this.scanScores();
          break;

        case "elvin":
          this.scanElvin();
          break;
      }
    }

    // Time's up: at 6 o'clock the mission fails.
    if (
      this.timeHour === 6 &&
      (activeScene === "room" || activeScene === "elevator")
    ) {
      this.initGameOver();
    }

    // Play all sounds requested during this frame.
    audio.playQueue();
  }

  /**
   * Time expired — Elvin wins. Plays the "hahaha" taunt, captures
   * the screen for the bomb animation, and hands off to the
   * gameOver scene.
   */
  private initGameOver() {
    if (sceneManager.getScene() === "gameOver") return;

    audio.stopAllSounds();
    audio.request({ name: "hahaha" });

    // Snapshot the canvas at the moment of failure — the bomb
    // animation shakes and bleaches this image.
    try {
      this.gameOverImage = new Image();
      this.gameOverImage.src = graphics.getCanvas().toDataURL("image/png");
    } catch {
      this.gameOverImage = null;
    }

    sceneManager.setScene("gameOver");
  }

  /**
   * The gameOver scan: run the bomb animation's clock, then move
   * on to the scores.
   */
  private scanGameOver() {
    this.gameOverFrames++;

    if (this.gameOverFrames > 250) {
      sceneManager.setScene("scores");
    }
  }

  /**
   * The Elvin scene: he throws his tantrum ("no, no, no!!"), then
   * the mission-accomplished speech plays over the scores.
   */
  private scanElvin() {
    this.elvinFrames++;

    if (this.elvinFrames === 1) {
      audio.stopAllSounds();
      audio.request({ name: "nonono", offset: 500 });
    } else if (this.elvinFrames > 210) {
      audio.request({ name: "mission.accomplished" });
      sceneManager.setScene("scores");
    }
  }

  /**
   * The scores scene: compute the final score once, slot it into
   * the hall of fame, then handle name entry.
   */
  private scanScores() {
    if (!this.scoreData) {
      let secondsRemaining = 0;

      if (this.missionComplete) {
        const hour = this.timeHour === 12 ? 0 : this.timeHour;
        secondsRemaining =
          (5 - hour) * 60 * 60 +
          (59 - this.timeMinute) * 60 +
          (60 - this.timeSecond);
      }

      const piecesFound = pocketComputer.getFoundedPieces();
      const solved = pocketComputer.getSolvedPuzzles();

      this.scoreData = {
        puzzlePiecesFound: piecesFound,
        puzzlePiecesFoundScore: piecesFound * 100,
        passwordsFound: this.passwordsFound,
        passwordsFoundScore: this.passwordsFound * 100,
        puzzlesSolved: solved,
        puzzlesSolvedScore: solved * 500,
        secondsRemaining,
        totalScore: 0,
        hallOfFamePosition: false,
      };

      this.scoreData.totalScore =
        this.scoreData.puzzlePiecesFoundScore +
        this.scoreData.passwordsFoundScore +
        this.scoreData.puzzlesSolvedScore +
        secondsRemaining;

      if (this.missionComplete) this.scoreData.totalScore += 1000;

      // Slot into the hall of fame: walk up from the bottom,
      // shifting worse scores down. A game that used cheat codes
      // shows its score but stays off the persisted list.
      if (!cheats.wasUsed()) {
        for (let i = this.highScores.length - 1; i >= -1; i--) {
          if (
            i === -1 ||
            this.scoreData.totalScore < this.highScores[i].score
          ) {
            this.highScores[i + 1] = {
              score: this.scoreData.totalScore,
              name: "-----",
            };
            if (i + 1 < 15) this.scoreData.hallOfFamePosition = i + 1;
            break;
          } else {
            this.highScores[i + 1] = {
              name: this.highScores[i].name,
              score: this.highScores[i].score,
            };
          }
        }

        // The shift can momentarily create a sixteenth entry.
        this.highScores.length = 15;
        this.saveHighScores();
      }

      return;
    }

    if (this.hallOfFameNameConfirmed) return;

    if (
      this.scoreData.hallOfFamePosition !== false &&
      this.scoreData.hallOfFamePosition < 14
    ) {
      // Name entry: letters and digits, Backspace, Enter (or five
      // characters) to confirm.
      if (keyboard.isKeyPressed("Enter") && this.hallOfFameName.length) {
        keyboard.setKeyState("Enter", "hold");
        this.hallOfFameNameConfirmed = true;
      } else if (
        keyboard.isKeyPressed("Backspace") &&
        this.hallOfFameName.length
      ) {
        keyboard.setKeyState("Backspace", "hold");
        this.hallOfFameName = this.hallOfFameName.slice(0, -1);
      } else {
        let pressed = "";

        for (let i = 0; i < 26; i++) {
          const code = `Key${String.fromCharCode(65 + i)}`;
          if (keyboard.isKeyPressed(code)) {
            keyboard.setKeyState(code, "hold");
            pressed = String.fromCharCode(65 + i);
          }
        }

        for (let i = 0; i < 10; i++) {
          const code = `Digit${i}`;
          if (keyboard.isKeyPressed(code)) {
            keyboard.setKeyState(code, "hold");
            pressed = `${i}`;
          }
        }

        if (pressed) {
          this.hallOfFameName += pressed;
          if (this.hallOfFameName.length === 5) {
            this.hallOfFameNameConfirmed = true;
          }
        }
      }

      if (this.hallOfFameNameConfirmed) {
        this.highScores[this.scoreData.hallOfFamePosition].name =
          this.hallOfFameName;
        this.saveHighScores();
      }
    } else {
      this.hallOfFameNameConfirmed = true;
    }
  }

  /**
   * The intro: Elvin's "another visitor... stay a while" speech
   * plays over the elevator view, then the pocket computer is
   * revealed and the elevator scene takes over. Matches the
   * original's one-shot request plus 6.5 second handoff.
   */
  private scanAnotherVisitor() {
    if (this.introStarted) return;
    this.introStarted = true;

    audio.request({ name: "another.visitor" });

    setTimeout(() => {
      pocketComputer.setVisible(true);
      sceneManager.setScene("elevator");
    }, 6500);
  }

  updateAnimation() {
    this.animationFrameCounter++;
    gameTime.setAFC(this.animationFrameCounter);

    if (this.transitionState) {
      if (this.transitionState === "close") {
        this.transitionHeight = this.transitionHeight + 7;

        if (this.transitionHeight >= 120) {
          this.transitionState = "open";

          if (this.transitionFunction) {
            this.transitionFunction();
            this.transitionFunction = undefined;
          }
        }
      } else if (this.transitionState === "open") {
        this.transitionHeight = this.transitionHeight - 7;

        if (this.transitionHeight <= 0) {
          this.transitionState = false;
        }
      }
    }

    switch (sceneManager.getScene()) {
      // The intro draws the elevator view; the pocket computer
      // skips drawing until it is revealed at handoff.
      case "anotherVisitor":
      case "elevator":
        elevator.animationRoutine();
        pocketComputer.animationRoutine();
        agent.animationRoutine();
        break;

      case "room":
        if (this.room) {
          this.room.animationRoutine();
          agent.animationRoutine();
        }
        break;

      case "terminal":
        this.actualTerminal?.sceneAnimationRoutine();
        break;

      case "gameOver":
        this.drawGameOver();
        break;

      case "scores":
        this.drawScores();
        break;

      case "elvin":
        this.drawElvin();
        break;
    }

    // This handles the transition between elevator shafts and
    // the rooms. This must be drawn AFTER scene rendering so
    // it appears on top.
    if (this.transitionState) {
      graphics.rect(0, 100, 320, -this.transitionHeight, 0);
      graphics.rect(0, 100, 320, +this.transitionHeight, 0);
    }

    // A cheat toggle announces itself briefly at the top of the
    // screen, over whatever scene is showing.
    const cheatBanner = cheats.getBanner();

    if (cheatBanner) {
      const x = Math.floor((320 - cheatBanner.length * 8) / 2);
      graphics.rect(x - 4, 4, cheatBanner.length * 8 + 8, 12, 0);
      graphics.text(cheatBanner, x, 13, 7);
    }
  }

  pause() {
    this.togglePause(true);
  }

  unpause() {
    this.togglePause(false);
  }

  isPaused(): boolean {
    return this.paused;
  }

  togglePause(status?: boolean): boolean {
    if (status === undefined) {
      status = !this.paused;
    }

    this.paused = status;
    const context = audio.getContext();

    if (!context) return status;

    if (this.paused) {
      context.suspend();
    } else {
      context.resume();
    }

    return status;
  }

  private placeItems() {
    this.placePuzzles();
    this.placeSnoozes();
    this.placeLiftResets();
  }

  private placePuzzles() {
    for (let i = 0; i < 36; ) {
      const roomId = rnd(30);

      if (!this.rooms[roomId].getFurnitureCount()) continue;

      if (this.rooms[roomId].placePuzzleinFurniture(i)) {
        i++;
      }
    }
  }

  private placeSnoozes() {
    for (let i = 0; i < 9; ) {
      const roomId = rnd(30);

      if (!this.rooms[roomId].getFurnitureCount()) continue;

      if (this.rooms[roomId].placeSnoozeInFurniture()) {
        i++;
      }
    }
  }

  private placeLiftResets() {
    for (let i = 0; i < 9; ) {
      const roomId = rnd(30);

      if (!this.rooms[roomId].getFurnitureCount()) continue;

      if (this.rooms[roomId].placeLiftResetInFurniture()) {
        i++;
      }
    }
  }

  private leaveRoom(direction: string) {
    if (!this.room) {
      return;
    }

    // Any active snooze ends when the agent leaves the room.
    this.snoozeTime = 0;

    if (direction === "left") {
      elevator.setShaft(this.room.getElevatorLeft());

      elevator.setY(
        this.room.getFloorLevel() * 432 +
          (layoutManager.hasLeftDoor(this.roomId) === 1 ? 0 : 216),
      );

      agent.setDirection("left");
      agent.setX(300);
      agent.setY(45);
    }

    if (direction === "right") {
      elevator.setShaft(this.room.getElevatorRight());

      elevator.setY(
        this.room.getFloorLevel() * 432 +
          (layoutManager.hasRightDoor(this.roomId) === 2 ? 0 : 216),
      );

      agent.setDirection("right");
      agent.setX(-16);
      agent.setY(45);
    }

    // Full stand reset (action, phase, jump/fall state, correctY)
    // so nothing stale carries across the scene boundary.
    agent.stand();

    // Stop all room sounds (e.g. the looping robot sound) and
    // reset the room so they restart if the player re-enters.
    audio.stopAllSounds();
    this.room.leave();

    sceneManager.setScene("elevator");
  }

  private enterRoom(direction: string) {
    agent.setRoomEnterDirection(direction);

    const elevatorPos = elevator.getCurrentPosition();
    const level = Math.floor(elevatorPos.y / 216 / 2);
    const elevatorIndex = elevatorPos.x - (direction === "left" ? 1 : 0);

    this.roomId = this.map.rooms[level][elevatorIndex];

    this.room = this.rooms[this.roomId];
    agent.setStartPosition(this.roomId);
    this.room.setRevealed(true);
    this.room.enter();

    sceneManager.setScene("room");

    // Elvin taunts "destroy him" once per clock hour (hours 1-5)
    // when entering a room with robots in it, freezing the room
    // briefly while the speech plays.
    if (
      this.destroyHimNextHour === this.timeHour &&
      this.room.getRobots().length
    ) {
      this.destroyHimNextHour++;

      if (this.destroyHimNextHour < 6) {
        this.skipScanFrames = 100;
        audio.request({ name: "destroy.him", offset: 800 });
      }
    }
  }

  /**
   * The nuclear-bomb game over: the last frame of play shakes and
   * bleaches white, then dissolves into black squares.
   */
  private drawGameOver() {
    if (this.gameOverFrames < 170) {
      // Image shaking and white explosion flashes.
      if (this.gameOverImage) {
        graphics.drawImage(
          this.gameOverImage,
          0,
          0,
          960,
          600,
          rnd(20) - 15,
          rnd(20) - 15,
          960,
          600,
        );
      }

      const whiteBg = rnd(170 - this.gameOverFrames);
      if (whiteBg < 20 || rnd(5) === 4) graphics.rect(0, 0, 320, 200, 1);
    } else if (this.gameOverFrames === 170) {
      // Fix the white background.
      graphics.rect(0, 0, 320, 200, 1);
    } else {
      // Black squares eat the screen.
      for (let i = 0; i < 30; i++) {
        const x = rnd(40) - 1;
        const y = rnd(25) - 1;
        graphics.rect(x * 8, y * 8, 8, 8, 0);
      }
    }
  }

  /**
   * Elvin's control room: he stomps and rages ("no, no, no!!")
   * among randomly flashing console LEDs. The backdrop is drawn
   * exactly once (the LED flashes accumulate on top of it); a
   * flag makes that robust against the render loop missing the
   * scene's first scan frame.
   */
  private drawElvin() {
    if (!this.elvinBackgroundDrawn && this.elvinFrames >= 1) {
      graphics.drawSprite(ELVIN_CONTROL_ROOM, 0, 0);
      this.elvinBackgroundDrawn = true;
    }

    if (this.elvinFrames < 165 && this.elvinFrames % 48 > 24) {
      graphics.drawSprite(ELVIN_FRAMES[0], 114, 136);
    } else {
      graphics.drawSprite(ELVIN_FRAMES[1], 114, 136);
    }

    // Flashing LEDs on the consoles.
    if (this.elvinFrames % 2) return;

    for (let i = 0; i < 30; i++) {
      const x = rnd(40) - 1;
      const y = rnd(6) - 1;
      if (y === 5 && x >= 14 && x <= 22) continue;
      graphics.rect(2 + x * 8, 2 + y * 8, 4, 5, rnd(8) - 1);
    }
  }

  /**
   * The final score board with the hall of fame and name entry.
   */
  private drawScores() {
    // Black background and the score board frame.
    graphics.rect(0, 0, 320, 200, 0);
    graphics.drawSprite(SCORE_BOARD_FRAME, 6, 0);

    // Static labels.
    graphics.text("puzzle pieces found", 16, 15, 7);
    graphics.text("passwords found", 16, 23, 7);
    graphics.text("x100 =", 208, 15, 7, 24, false);
    graphics.text("x100 =", 208, 23, 7, 24, false);
    graphics.text("puzzles solved", 16, 47, 7);
    graphics.text("seconds remaining", 16, 55, 7);
    graphics.text("x500 =", 208, 47, 7, 24, false);
    graphics.text("t o t a l   s c o r e", 16, 103, 7);

    if (!this.scoreData) return;

    const s = this.scoreData;
    const pad = this.rightAlignedText;

    graphics.text(pad(s.puzzlePiecesFound, 2), 192, 15, 1);
    graphics.text(pad(s.puzzlePiecesFoundScore, 5), 256, 15, 1);
    graphics.text(pad(s.passwordsFound, 2), 192, 23, 1);
    graphics.text(pad(s.passwordsFoundScore, 5), 256, 23, 1);
    graphics.text(pad(s.puzzlesSolved, 2), 192, 47, 1);
    graphics.text(pad(s.puzzlesSolvedScore, 5), 256, 47, 1);
    graphics.text(pad(s.secondsRemaining, 5), 256, 55, 1);
    graphics.text(pad(s.totalScore, 6), 248, 103, 1);

    if (this.missionComplete) {
      graphics.text("mission complete", 16, 79, 7);
      graphics.text("1000", 264, 79, 1);
    } else {
      graphics.text("m i s s i o n   t e r m i n a t e d", 16, 79, 7);
    }

    // A brand-new high score gets a special callout.
    if (s.hallOfFamePosition === 0) {
      graphics.text("this surpasses the previous", 32, 111, 5);
      graphics.text("high score of      .", 32, 119, 5);
      graphics.text(pad(this.highScores[1].score, 5), 144, 119, 1);
    }

    // Hall of fame: three columns of five.
    graphics.text("hall of fame", 104, 151, 7);

    for (let i = 0; i < this.highScores.length; i++) {
      const entry = this.highScores[i];
      const x = 16 + Math.floor(i / 5) * 96;
      const y = 159 + (i % 5) * 8;

      graphics.text(pad(entry.score, 5), x, y, 1);
      if (s.hallOfFamePosition !== i) graphics.text(entry.name, x + 48, y, 4);
    }

    // Name entry at the new score's slot.
    if (s.hallOfFamePosition !== false) {
      const x = 64 + Math.floor(s.hallOfFamePosition / 5) * 96;
      const y = 159 + (s.hallOfFamePosition % 5) * 8;
      graphics.text(this.hallOfFameName, x, y, 4);

      if (!this.hallOfFameNameConfirmed) {
        graphics.text("_", x + this.hallOfFameName.length * 8, y, 7);
        graphics.text("enter your i.d. code on the keyboard", 16, 143, 7);
      }
    }

    if (this.hallOfFameNameConfirmed) {
      graphics.text("hit    for new game", 80, 143, 5);
      graphics.text("f5", 112, 143, 7);
    }
  }

  /**
   * Right-aligns a value into a fixed-width field, truncating if
   * it is too long.
   */
  private rightAlignedText(value: number | string, length: number): string {
    let text = value.toString();
    if (text.length >= length) return text.slice(0, length);
    return text.padStart(length, " ");
  }

  private startTransition(cb: () => void) {
    if (this.transitionState) {
      return;
    }

    this.transitionState = "close";
    this.transitionHeight = 0;
    this.transitionFunction = cb;
  }

  private generateRooms() {
    for (let i = 1; i <= 32; i++) {
      this.rooms[i] = new Room(i);
      this.rooms[i].init();
    }
  }
}

export const game: Game = new Game();
