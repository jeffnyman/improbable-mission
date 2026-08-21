import { game } from "../game";
import { gameTime } from "../common/gameTime";
import { keyboard } from "../common/keyboardManager";
import { log } from "../utils/logger";
import { rnd } from "../utils/common";
import { graphics } from "../utils/graphics";
import {
  innerLifts,
  roomColors,
  roomPlatforms,
  roomFurnitureItems,
  roomTerminalItems,
  orbEnemies,
  robotEnemies,
} from "../data/layout";
import { layoutManager } from "../common/layoutManager";
import { calculateRoomConnections } from "../utils/roomConnections";
import type {
  RoomPlatform,
  InnerLiftData,
  FurnitureItemData,
  TerminalItemData,
  OrbEnemyData,
  RobotEnemyData,
} from "../types/layout";
import type { Agent } from "./agent";
import { InnerLift } from "./innerLift";
import { Furniture } from "./furniture";
import { Terminal } from "./terminal";
import { Orb } from "./orb";
import { Robot } from "./robot";
import { Puzzle } from "./puzzle";
import { audio } from "../common/audioManager";
import {
  ORGAN_CONSOLE,
  ORGAN_GLOVE,
  ORGAN_NUMPAD_FRAMES,
  ORGAN_PLAY_FIELD,
  PLATFORM_TILE_A,
  PLATFORM_TILE_B,
  ROOM_WALL_LEFT_SEGMENT,
  ROOM_WALL_RIGHT_SEGMENT,
} from "../data/spriteRegions";

export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private id: number;

  // A room is revealed when the agent enters it.
  // This acts as a flag for the pocket computer map.
  private revealed = false;

  // This is the elevator level, which can run from 1 to 6.
  // A value of -1 means no elevator level.
  private floorLevel = -1;

  // These refer to the left and right side elevator numbers.
  // The values can run from 1 to 8. A value of 0 indicates
  // that there is no elevator to the left or right.
  private elevatorLeft = 0;
  private elevatorRight = 0;

  // Holds all the inner lift objects for the room.
  private liftGroups: InnerLift[] = [];

  // Holds all the furniture objects for the room.
  private furnitureItems: Furniture[] = [];

  // Holds all the terminal items for the room.
  private terminalItems: Terminal[] = [];

  // Holds the orb enemy for the room. This can be
  // null if the room has no orb enemy.
  private orbEnemy: Orb | null = null;

  // Holds all the robot enemies for the room.
  private robotEnemies: Robot[] = [];

  // Trigger for the background noise of the robots
  // as they move around.
  private robotSound: boolean | "start" = "start";

  // Rooms 31 and 32 are the organ music rooms, which host a
  // tone-memory bonus game instead of furniture and enemies.
  private type: "normal" | "organ";

  // State for the organ game (only used by organ rooms).
  private organ = {
    // The first, upper-left checkerboard square's color.
    checkerboardStartColor: 0,
    // How many tones play in the next round (grows on each win).
    nextStep: 3,
    // The round's tones: checkerboard position, cross color, and
    // which organTone sample (1-14) they play.
    tones: [] as { x: number; y: number; color: number; tone: number }[],
    pointerX: 134,
    pointerY: 60,
    status: "playTones" as "playTones" | "pointer" | "clickTone" | "win",
    playTonesFrames: 0,
    clickToneFrames: 0,
    clickedToneIndex: false as number | false,
    // Clicked tone indexes; the round is won by clicking every
    // tone in ascending tone order.
    clickedTones: [] as number[],
    winFrameCounter: 0,
  };

  constructor(id: number) {
    this.id = id;
    this.type = id < 31 ? "normal" : "organ";
  }

  getType() {
    return this.type;
  }

  resetOrgan() {
    if (this.type !== "organ") return;

    this.organ.checkerboardStartColor = 0;
    this.organ.tones = [];
    this.organ.pointerX = 134;
    this.organ.pointerY = 60;
    this.organ.status = "playTones";
    this.organ.playTonesFrames = 0;
    this.organ.clickToneFrames = 0;
    this.organ.clickedTones = [];
  }

  init() {
    this.setupRoomConnections();
    this.setupInnerLifts();
    this.setupFurnitureItems();
    this.setupTerminalItems();
    this.setupOrbEnemies();
    this.setupRobotEnemies();
  }

  getLiftGroups() {
    return this.liftGroups;
  }

  getOrb() {
    return this.orbEnemy;
  }

  getRobots() {
    return this.robotEnemies;
  }

  getFurnitureItems() {
    return this.furnitureItems;
  }

  getTerminals() {
    return this.terminalItems;
  }

  resetLifts() {
    for (const liftGroup of this.liftGroups) {
      liftGroup.reset();
    }
  }

  /**
   * Marks the robot loop sound as needing a restart (e.g. after
   * logging off a terminal, which silences the room).
   */
  restartRobotSound() {
    this.robotSound = "start";
  }

  getFloorLevel() {
    return this.floorLevel;
  }

  getElevatorLeft() {
    return this.elevatorLeft;
  }

  getElevatorRight() {
    return this.elevatorRight;
  }

  getFurnitureCount() {
    return this.furnitureItems.length;
  }

  setRevealed(value: boolean) {
    this.revealed = value;
  }

  enter() {
    // Reset all enemies to their starting positions each time the
    // player enters the room.
    this.orbEnemy?.reset();
    for (const robot of this.robotEnemies) {
      robot.reset();
    }
  }

  leave() {
    // Reset robot sound so it restarts when the player re-enters.
    this.robotSound = "start";
  }

  /**
   * Resets the room after the agent dies in it: any active snooze ends,
   * lifts return to their starting stations, enemies to their starting
   * positions, and the agent respawns at the door they entered through.
   *
   * The snooze has to be cleared here specifically. Game.leaveRoom
   * clears it too, but dying does not leave the room — the agent
   * respawns inside it — so without this line a snooze bought before
   * the death would carry on protecting the player afterwards, with the
   * robots reset to their starting positions and still frozen. The
   * original clears it as the first thing resetAfterDie does
   * (imp1_fixed/js/v1.0/rooms.js).
   *
   * The ten-minute death penalty is not charged here — the agent
   * charges it itself on the frame the death resolves, next to its two
   * calls into this method.
   */
  resetAfterDie(agent: Agent) {
    game.setSnoozeTime(0);

    for (const liftGroup of this.liftGroups) {
      liftGroup.reset();
    }

    this.orbEnemy?.reset();
    for (const robot of this.robotEnemies) {
      robot.reset();
    }

    agent.setStartPosition(this.id);
    this.robotSound = "start";
  }

  isRevealed() {
    return this.revealed;
  }

  scanRoutine(agent: Agent) {
    // Organ rooms run the tone game instead of the normal room
    // simulation.
    if (this.type === "organ") {
      this.scanOrgan(agent);
      return;
    }

    // Snooze time counts down while the agent is in the room, and
    // silences the robot loop while active.
    if (game.getSnoozeTime() > 0) {
      if (this.robotSound !== false) {
        audio.stopAllSounds();
        this.robotSound = false;
      }

      game.setSnoozeTime(game.getSnoozeTime() - 1);
    }

    if (
      (!this.robotSound || this.robotSound === "start") &&
      this.robotEnemies.length &&
      !game.getSnoozeTime()
    ) {
      this.robotSound = audio.request({ name: "droid", loop: true });
    }

    for (const liftGroup of this.liftGroups) {
      liftGroup.scanRoutine(agent, this.orbEnemy);
    }

    if (this.orbEnemy !== null) {
      this.orbEnemy.scanRoutine(this.liftGroups, agent, this.robotEnemies);
    }

    for (const robotEnemy of this.robotEnemies) {
      robotEnemy.scanRoutine();
    }
  }

  /**
   * The organ music room's tone game, ported from the original
   * rooms.js. The organ plays a sequence of tones highlighting
   * checkerboard squares; the player must click the squares in
   * ascending tone order. Each win banks a snooze or lift-init
   * bonus and grows the next round by one tone.
   */
  private scanOrgan(agent: Agent) {
    if (agent.getAction() !== "organ") return;

    const actionLeft = keyboard.isKeyPressed(keyboard.keys.LEFT);
    const actionRight = keyboard.isKeyPressed(keyboard.keys.RIGHT);
    const actionUp = keyboard.isKeyPressed(keyboard.keys.UP);
    const actionDown = keyboard.isKeyPressed(keyboard.keys.DOWN);
    const actionFire = keyboard.isKeyPressed(keyboard.keys.SHIFT);

    if (this.organ.status === "playTones") {
      if (!this.organ.tones.length) {
        // Generate this round's tones: unique samples on unique
        // squares, with cross colors that read against the board.
        for (let i = 0; i < this.organ.nextStep; i++) {
          let tone = 0;
          let x = 0;
          let y = 0;
          let color = 0;
          let valid = true;

          do {
            valid = true;
            tone = rnd(14);
            x = rnd(8) - 1;
            y = rnd(4) - 1;

            do {
              color = rnd(13) + 1;
            } while (color === 5 || color === 11 || color === 12);

            for (let j = 0; j < i; j++) {
              if (this.organ.tones[j].tone === tone) valid = false;
              if (this.organ.tones[j].x === x && this.organ.tones[j].y === y) {
                valid = false;
              }
            }
          } while (!valid);

          this.organ.tones.push({ x, y, color, tone });
        }
      }

      if (this.organ.playTonesFrames % 25 === 0) {
        const actualTone = this.organ.playTonesFrames / 25;

        if (actualTone === this.organ.nextStep) {
          this.organ.status = "pointer";
        } else {
          audio.request({
            name: `organ.tone${this.organ.tones[actualTone].tone}`,
          });
        }
      }

      this.organ.playTonesFrames++;
    }

    if (this.organ.status === "pointer") {
      if (actionLeft) this.organ.pointerX -= 3;
      if (actionRight) this.organ.pointerX += 3;
      if (actionUp) this.organ.pointerY -= 2;
      if (actionDown) this.organ.pointerY += 2;

      // Pointer limits.
      if (this.organ.pointerX < 32) this.organ.pointerX = 32;
      if (this.organ.pointerX > 284) this.organ.pointerX = 284;
      if (this.organ.pointerY < 33) this.organ.pointerY = 33;
      if (this.organ.pointerY > 133) this.organ.pointerY = 133;

      if (actionFire) {
        keyboard.setKeyState(keyboard.keys.SHIFT, "hold");

        // Clicking below the board exits the game.
        if (this.organ.pointerY >= 128) {
          this.resetOrgan();
          agent.stand();
          return;
        }

        // Which square was clicked?
        const x = Math.floor((this.organ.pointerX - 32) / 32);
        const y = Math.floor((this.organ.pointerY - 32) / 24);

        for (let i = 0; i < this.organ.tones.length; i++) {
          const tone = this.organ.tones[i];

          if (tone.x === x && tone.y === y) {
            this.organ.status = "clickTone";
            this.organ.clickToneFrames = 0;
            this.organ.clickedToneIndex = i;
            audio.request({ name: `organ.tone${tone.tone}` });
            break;
          }
        }
      }
    }

    if (this.organ.status === "clickTone") {
      this.organ.clickToneFrames++;

      if (this.organ.clickToneFrames % 25 === 0) {
        // The clicked tone must be higher than every previously
        // clicked tone, or the sequence resets.
        let fail = false;

        for (const clickedIndex of this.organ.clickedTones) {
          const previous = this.organ.tones[clickedIndex];
          const current = this.organ.tones[
            this.organ.clickedToneIndex as number
          ];

          if (previous.tone >= current.tone) {
            this.organ.clickedTones = [];
            fail = true;
            break;
          }
        }

        this.organ.clickedTones.push(this.organ.clickedToneIndex as number);
        this.organ.clickedToneIndex = false;
        this.organ.clickToneFrames = 0;

        if (!fail && this.organ.clickedTones.length === this.organ.nextStep) {
          this.organ.winFrameCounter = 0;
          this.organ.status = "win";
        } else {
          this.organ.status = "pointer";
        }
      }
    }

    if (this.organ.status === "win") {
      this.organ.winFrameCounter++;

      // Flash the checkerboard.
      this.organ.checkerboardStartColor =
        this.organ.winFrameCounter % 4 < 2 ? 0 : 1;

      if (this.organ.winFrameCounter === 50) {
        // Earn a bonus: alternating rounds grant a snooze or a
        // lift init.
        if (this.organ.nextStep % 2 === 0) {
          game.setSnoozes(game.getSnoozes() + 1);
        } else {
          game.setLiftInits(game.getLiftInits() + 1);
        }

        this.organ.nextStep++;
        this.resetOrgan();
        agent.stand();
      }
    }
  }

  animationRoutine() {
    const platforms: RoomPlatform[] = (
      roomPlatforms as Record<number, RoomPlatform[]>
    )[this.id];

    const bg = roomColors[this.id].bg;

    // Show the room background.
    graphics.rect(0, 0, 320, 200, bg);

    // Draw the room borders.
    for (let i = 0; i < 25; i++) {
      graphics.drawSprite(ROOM_WALL_LEFT_SEGMENT, 0, 0 + i * 8);
      graphics.drawSprite(ROOM_WALL_RIGHT_SEGMENT, 312, 0 + i * 8);
    }

    // Cut out the doors from the borders.

    // Left top.
    if (layoutManager.hasLeftDoor(this.id) === 1) {
      graphics.rect(0, 8, 8, 40, bg);
    }

    // Left bottom.
    if (layoutManager.hasLeftDoor(this.id) === 4) {
      graphics.rect(0, 152, 8, 48, bg);
    }

    // Right top.
    if (layoutManager.hasRightDoor(this.id) === 2) {
      graphics.rect(312, 8, 8, 40, bg);
    }

    // Right bottom.
    if (layoutManager.hasRightDoor(this.id) === 3) {
      graphics.rect(312, 152, 8, 48, bg);
    }

    // Draw the platforms.
    for (const platform of platforms) {
      for (let segment = 0; segment < platform.l; segment++) {
        // The two floor tiles alternate along the run, and `p` is
        // which one it starts on.
        const useTileB =
          platform.p === 1 ? segment % 2 === 1 : segment % 2 === 0;

        graphics.drawSprite(
          useTileB ? PLATFORM_TILE_B : PLATFORM_TILE_A,
          platform.x * 8 + segment * 8,
          platform.y * 8,
        );
      }
    }

    if (this.type === "organ") {
      this.drawOrgan();
      return;
    }

    // Draw the inner lifts.
    for (const lift of this.liftGroups) {
      lift.animationRoutine();
    }

    // Draw the furniture.
    for (const furniture of this.furnitureItems) {
      furniture.draw();
    }

    // Draw the terminals.
    for (const terminalItem of this.terminalItems) {
      terminalItem.draw();
    }

    // Draw the orb, if one exists for the room.
    if (this.orbEnemy) {
      this.orbEnemy.animationRoutine();
    }

    // Draw any robot enemies in the room.
    for (const robot of this.robotEnemies) {
      robot.animationRoutine();
    }
  }

  /**
   * Draws the organ room: the console, the checkerboard play
   * field, highlighted tone squares, and the pointer.
   */
  private drawOrgan() {
    // Controller wire.
    graphics.drawSprite(ORGAN_CONSOLE, 136, 142);
    // Controller numpad (blinking).
    graphics.drawSprite(
      ORGAN_NUMPAD_FRAMES[gameTime.getAFC() % 20 < 10 ? 0 : 1],
      136,
      176,
    );
    // Play field.
    graphics.drawSprite(ORGAN_PLAY_FIELD, 24, 26);

    // Draw the checkerboard.
    let squareColor = this.organ.checkerboardStartColor;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        graphics.rect(32 + j * 32, 32 + i * 24, 32, 24, squareColor);
        if (j < 7) squareColor = 1 - squareColor;
      }
    }

    // Highlight the squares of the tones played so far.
    let actualToneIndex: number | false = false;

    if (this.organ.status !== "win" && this.organ.tones.length) {
      actualToneIndex = Math.min(
        Math.floor(this.organ.playTonesFrames / 25),
        this.organ.nextStep - 1,
      );

      for (let i = 0; i <= actualToneIndex; i++) {
        const tone = this.organ.tones[i];
        graphics.rect(32 + tone.x * 32, 32 + tone.y * 24, 32, 24, 5);
      }
    }

    if (this.organ.status === "pointer" || this.organ.status === "clickTone") {
      graphics.drawSprite(ORGAN_GLOVE, this.organ.pointerX, this.organ.pointerY);
    }

    // Draw the cross mark on the currently sounding tone.
    let tone: { x: number; y: number; color: number } | false = false;

    if (this.organ.status === "playTones" && actualToneIndex !== false) {
      tone = this.organ.tones[actualToneIndex];
    }
    if (
      this.organ.status === "clickTone" &&
      this.organ.clickedToneIndex !== false
    ) {
      tone = this.organ.tones[this.organ.clickedToneIndex];
    }

    if (tone) {
      const sx = 32 + tone.x * 32;
      const sy = 32 + tone.y * 24;

      graphics.line(sx + 5, sy + 2, sx + 14, sy + 10, 10, tone.color);
      graphics.line(sx + 5, sy + 22, sx + 14, sy + 14, 10, tone.color);
      graphics.line(sx + 27, sy + 2, sx + 18, sy + 10, 10, tone.color);
      graphics.line(sx + 27, sy + 22, sx + 18, sy + 14, 10, tone.color);
    }
  }

  placePuzzleinFurniture(puzzleIndex: number): boolean {
    if (this.furnitureItems.length === 0) return false;

    const index = Math.floor(Math.random() * this.furnitureItems.length);
    const furniture = this.furnitureItems[index];

    // Cannot place puzzle in exit furniture or furniture that
    // already has contents.
    if (
      furniture.getKind() === "exit" ||
      furniture.getContents() !== "nothing"
    ) {
      return false;
    }

    furniture.setContents("puzzle");

    // The piece takes this room's background color (always 3, 5,
    // or 7 — the three puzzle colors) plus random flips.
    const puzzle = new Puzzle(puzzleIndex);
    puzzle.setRandomProperties(roomColors[this.id].bg);
    furniture.setPuzzle(puzzle);

    return true;
  }

  placeSnoozeInFurniture(): boolean {
    if (this.furnitureItems.length === 0) return false;

    const index = Math.floor(Math.random() * this.furnitureItems.length);
    const furniture = this.furnitureItems[index];

    // Cannot place snooze in exit furniture or furniture that
    // already has contents.

    if (
      furniture.getKind() === "exit" ||
      furniture.getContents() !== "nothing"
    ) {
      return false;
    }

    furniture.setContents("snooze");

    return true;
  }

  placeLiftResetInFurniture(): boolean {
    if (this.furnitureItems.length === 0) return false;

    const index = Math.floor(Math.random() * this.furnitureItems.length);
    const furniture = this.furnitureItems[index];

    // Cannot place liftReset in exit furniture or furniture that
    // already has contents.
    if (
      furniture.getKind() === "exit" ||
      furniture.getContents() !== "nothing"
    ) {
      return false;
    }

    furniture.setContents("liftReset");

    return true;
  }

  private setupInnerLifts() {
    const lifts: InnerLiftData[] = (
      innerLifts as Record<number, InnerLiftData[]>
    )[this.id];

    for (let i = 0; i < lifts.length; i++) {
      const lift = lifts[i];
      this.liftGroups[i] = new InnerLift(lift.l);
      this.liftGroups[i].init(lift.s);
    }
  }

  private setupFurnitureItems() {
    const items: FurnitureItemData[] = (
      roomFurnitureItems as Record<number, FurnitureItemData[]>
    )[this.id];

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      this.furnitureItems[i] = new Furniture(
        this.id,
        item.kind,
        item.l,
        item.b,
      );
      this.furnitureItems[i].init();
    }
  }

  private setupTerminalItems() {
    const items: TerminalItemData[] = (
      roomTerminalItems as Record<number, TerminalItemData[]>
    )[this.id];

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      this.terminalItems[i] = new Terminal(this.id, item.l, item.b);
      this.terminalItems[i].init();
    }
  }

  private setupOrbEnemies() {
    const orbData = (orbEnemies as Record<number, OrbEnemyData>)[this.id];

    if (orbData) {
      this.orbEnemy = new Orb(this.id);
      this.orbEnemy.init();
    }
  }

  private setupRobotEnemies() {
    const items: RobotEnemyData[] = (
      robotEnemies as Record<number, RobotEnemyData[]>
    )[this.id];

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      this.robotEnemies[i] = new Robot(this.id, item.l, item.b);
      this.robotEnemies[i].init();
    }
  }

  private setupRoomConnections() {
    const rooms = game.getMap().rooms;
    const connection = calculateRoomConnections(this.id, rooms);

    if (!connection) {
      return;
    }

    this.floorLevel = connection.level;

    log(
      `Room ${this.id} is at level ${connection.level}, elevator ${connection.elevator}`,
    );

    if (connection.leftDoor) {
      this.elevatorLeft = connection.leftDoor.elevator;
      const leftDoorPosition = connection.leftDoor.position;

      log(
        `Left door connects to elevator shaft ${this.elevatorLeft} at ${leftDoorPosition}`,
      );
    }

    if (connection.rightDoor) {
      this.elevatorRight = connection.rightDoor.elevator;
      const rightDoorPosition = connection.rightDoor.position;

      log(
        `Right door connects to elevator shaft ${this.elevatorRight} at ${rightDoorPosition}`,
      );
    }
  }
}
