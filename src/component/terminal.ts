import { audio } from "../common/audioManager";
import { game } from "../game";
import { graphics } from "../utils/graphics";
import { keyboard } from "../common/keyboardManager";
import { sceneManager } from "../common/sceneManager";
import { sprites } from "../utils/sprites";
import { options } from "../utils/options";
import { getActualPalette, getColorIndex } from "../utils/paletteUtils";
import { roomColors } from "../data/layout";
import type { RoomColor } from "../types/layout";
import {
  TERMINAL_ASTERISKS,
  TERMINAL_MESSAGE_PANEL,
} from "../data/spriteRegions";

export class Terminal {
  private roomId: number;
  private left: number;
  private bottom: number;
  private spriteSheet = sprites.getSpriteSheet();
  private paletteName = options.getPaletteOption();

  // Menu position: 1 = lift reset request, 2 = snooze request,
  // 3 = log off.
  private menu = 3;

  // Response message: 1 = lift reset accepted, 2 = lift reset
  // denied, 3 = snooze accepted, 4 = snooze denied.
  private message: false | 1 | 2 | 3 | 4 = false;

  // Colored imageData for drawing the furniture.
  private imageData: HTMLImageElement | null = null;

  constructor(roomId: number, left: number, bottom: number) {
    this.roomId = roomId;
    this.left = left;
    this.bottom = bottom;
  }

  init() {
    this.generateImage();
  }

  getLeft() {
    return this.left;
  }

  getBottom() {
    return this.bottom;
  }

  setMenu(menu: number) {
    this.menu = menu;
  }

  /**
   * Draws the full-screen security terminal monitor for the
   * terminal scene.
   */
  sceneAnimationRoutine() {
    const rc = (roomColors as Record<number, RoomColor>)[this.roomId];
    const mc = rc.ps === 12 ? 11 : 12;

    // Background.
    graphics.rect(0, 0, 320, 200, rc.bg);
    // Desk shape.
    graphics.rect(0, 196, 320, 4, rc.ps);
    // Desk surface.
    graphics.poly(mc, [
      [22, 177],
      [298, 177],
      [340, 196],
      [-20, 196],
    ]);
    // Monitor stand.
    graphics.rect(64, 168, 192, 24, 0);
    // Monitor border.
    graphics.rect(16, 0, 288, 168, rc.ps);
    // Monitor border corners.
    graphics.strokeArc(20, 4, 6, 180, 270, 10, rc.bg);
    graphics.strokeArc(300, 4, 6, 270, 0, 10, rc.bg);
    graphics.strokeArc(20, 164, 6, 90, 180, 10, rc.bg);
    graphics.strokeArc(300, 164, 6, 0, 90, 10, rc.bg);
    // Monitor inner corners.
    graphics.rect(32, 8, 256, 152, 15);
    // Monitor inner walls.
    graphics.poly(0, [
      [32, 9],
      [44, 20],
      [44, 148],
      [32, 160],
    ]);
    graphics.poly(0, [
      [32, 8],
      [287, 8],
      [275, 20],
      [45, 20],
    ]);
    graphics.poly(mc, [
      [288, 8],
      [288, 160],
      [276, 148],
      [276, 20],
    ]);
    graphics.poly(mc, [
      [45, 148],
      [275, 148],
      [287, 160],
      [33, 160],
    ]);
    // Monitor image.
    graphics.rect(44, 20, 232, 128, 9);
    // Asterisks.
    graphics.drawSprite(TERMINAL_ASTERISKS, 48, 24);
    graphics.drawSprite(TERMINAL_ASTERISKS, 248, 24);

    // Monitor texts.
    const id = this.roomId < 10 ? `0${this.roomId}` : `${this.roomId}`;
    graphics.text(`security terminal ${id}`, 80, 31, 7);
    graphics.text("select function", 96, 47, 7);

    if (this.message === 1 || this.message === 2) {
      graphics.drawSprite(TERMINAL_MESSAGE_PANEL, 80, 56);
      if (this.message === 1) graphics.text("password accepted", 96, 71, 7);
      if (this.message === 2) graphics.text("password required", 96, 71, 7);
    } else {
      graphics.text("reset lifting platforms", 80, 63, 7);
      graphics.text("in this room.", 96, 71, 7);
    }

    if (this.message === 3 || this.message === 4) {
      graphics.drawSprite(TERMINAL_MESSAGE_PANEL, 80, 80);
      if (this.message === 3) graphics.text("password accepted", 96, 95, 7);
      if (this.message === 4) graphics.text("password required", 96, 95, 7);
    } else {
      graphics.text("temporarily disable", 80, 87, 7);
      graphics.text("robots in this room.", 96, 95, 7);
    }

    graphics.text("log off.", 80, 143, 7);

    // Draw the menu arrow.
    let y = 143;
    if (this.menu === 1) y = 63;
    if (this.menu === 2) y = 87;
    graphics.text("==>", 48, y, 7);
  }

  /**
   * Menu navigation and actions for the terminal scene.
   */
  sceneScanRoutine() {
    if (this.message) return;

    // The terminal is silent: any lingering room sounds stop.
    audio.stopAllSounds();

    const actionUp = keyboard.isKeyPressed(keyboard.keys.UP);
    const actionDown = keyboard.isKeyPressed(keyboard.keys.DOWN);
    const actionFire = keyboard.isKeyPressed(keyboard.keys.SHIFT);

    if (actionUp && !actionDown) {
      keyboard.setKeyState(keyboard.keys.UP, "hold");
      this.menu--;
      if (this.menu < 1) this.menu = 1;
    }

    if (actionDown && !actionUp) {
      keyboard.setKeyState(keyboard.keys.DOWN, "hold");
      this.menu++;
      if (this.menu > 3) this.menu = 3;
    }

    if (!actionUp && !actionDown && actionFire) {
      keyboard.setKeyState(keyboard.keys.SHIFT, "hold");

      if (this.menu === 1) {
        // Reset the lifting platforms — requires a banked lift
        // reset password.
        if (game.getLiftInits() > 0) {
          game.setLiftInits(game.getLiftInits() - 1);
          game.getRoom(game.getRoomId())?.resetLifts();
          this.flashMessage(1);
        } else {
          this.flashMessage(2);
        }
      } else if (this.menu === 2) {
        // Snooze the robots — requires a banked snooze password.
        if (game.getSnoozes() > 0) {
          game.setSnoozes(game.getSnoozes() - 1);
          game.setSnoozeTime(600); // ~16 seconds
          this.flashMessage(3);
        } else {
          this.flashMessage(4);
        }
      } else if (this.menu === 3) {
        // Log off, back to the room.
        const room = game.getRoom(game.getRoomId());
        if (room && room.getRobots().length) room.restartRobotSound();

        sceneManager.setScene("room");
        game.setActualTerminal(null);
        this.message = false;
      }
    }
  }

  private flashMessage(message: 1 | 2 | 3 | 4) {
    this.message = message;
    setTimeout(() => {
      this.message = false;
    }, 1800);
  }

  draw() {
    if (!this.imageData) return;

    graphics.drawImage(
      this.imageData,
      0,
      0,
      24,
      22,
      this.left * 8 * 3,
      ((this.bottom + 1) * 8 - 22) * 3,
      24 * 3,
      22 * 3,
    );
  }

  private generateImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 22;

    const context = graphics.getRenderingContext2D(canvas);
    context.drawImage(this.spriteSheet, 589, 544, 24, 22, 0, 0, 24, 22);

    const baseSpriteData = context.getImageData(0, 0, 24, 22);
    const baseSpritePixels = baseSpriteData.data;
    const newImageData = context.createImageData(24, 22);
    const rcp = getActualPalette(this.paletteName);
    const roomColor = (roomColors as Record<number, RoomColor>)[this.roomId];

    for (let i = 0, n = baseSpritePixels.length; i < n; i += 4) {
      const colorIndex = getColorIndex(
        baseSpritePixels[i],
        baseSpritePixels[i + 1],
        baseSpritePixels[i + 2],
      );

      if (colorIndex === false) {
        // Color not found in palette, copy original pixel
        newImageData.data[i] = baseSpritePixels[i];
        newImageData.data[i + 1] = baseSpritePixels[i + 1];
        newImageData.data[i + 2] = baseSpritePixels[i + 2];
        newImageData.data[i + 3] = baseSpritePixels[i + 3];
        continue;
      }

      let rc;

      if (colorIndex === 14 && roomColor.pg !== undefined) {
        rc = rcp[roomColor.pg];
      } else if (colorIndex === 1 && roomColor.ps !== undefined) {
        rc = rcp[roomColor.ps];
      } else {
        rc = rcp[colorIndex];
      }

      newImageData.data[i] = parseInt(rc[0] + rc[1], 16);
      newImageData.data[i + 1] = parseInt(rc[2] + rc[3], 16);
      newImageData.data[i + 2] = parseInt(rc[4] + rc[5], 16);
      newImageData.data[i + 3] = baseSpritePixels[i + 3];
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 24;
    tmpCanvas.height = 22;

    const tmpContext = graphics.getRenderingContext2D(tmpCanvas);
    tmpContext.putImageData(newImageData, 0, 0);

    this.imageData = new Image();
    this.imageData.src = tmpCanvas.toDataURL("image/png");
  }
}
