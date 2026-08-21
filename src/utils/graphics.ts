import { browser } from "./browser";
import { options } from "./options";
import { sprites } from "./sprites";
import { paletteSelector } from "../ui/paletteSelector";
import type { PaletteArray } from "../types/palette";
import type { SpriteRegion } from "../types/sprites";

/**
 * The font for every string drawn on the canvas — the clock, the
 * terminal menus, the pocket computer, the search box.
 *
 * This has to name a family the page has actually loaded. It used to
 * ask for "C64ProMonoRegular", which no @font-face in this project
 * defines, so every string silently rendered in the browser's default
 * serif instead. That was not just ugly: the layout numbers inherited
 * from the original assume a monospaced cell one em wide, so in a
 * proportional font "Searching" shrank to about 44% of its box and
 * appeared to be left-aligned inside it.
 *
 * Sixtyfour is the C64-style face already shipped in public/fonts and
 * declared in public/styles/fonts.css, and it is monospaced at a
 * one-em advance — which is exactly what those numbers were written
 * for. The stack matches the one in mission.css.
 */
const CANVAS_FONT = 'Sixtyfour, "Courier New", Courier, monospace';

/**
 * Every drawing primitive in the game goes through here, and they all
 * share one contract: the coordinates you pass are *logical* pixels on
 * the C64's 320x200 screen, and this class multiplies them up to the
 * 960x600 canvas. Nothing outside this file should know about the
 * canvas's real size.
 *
 * That is what lets the rest of the codebase use the original's own
 * numbers verbatim — a platform at x: 4 in data/layout.ts is at
 * character cell 4, logical pixel 32, canvas pixel 96, and only the
 * first two ever appear in game code.
 *
 * The one exception is the source rectangle of a sprite: sx/sy/sw/sh
 * index into the sprite sheet at its own scale and are passed through
 * untouched.
 *
 * Colors are not colors either. A paletteColor argument is an index
 * into the 16-entry C64 palette the player selected, resolved through
 * gameColors, so the same draw call re-skins itself when the palette
 * changes.
 */
class Graphics {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private palette: string | null = null;
  private gameColors: PaletteArray | null = null;

  // 320x200 logical pixels drawn at 3x gives the 960x600 canvas the
  // markup declares. Changing one without the other will not end well.
  private readonly SCALE_FACTOR = 3;

  init(canvasId: string) {
    this.canvas = this.getCanvasById(canvasId);
    this.ctx = this.getRenderingContext2D(this.canvas);
    this.ctx.imageSmoothingEnabled = false;
    this.palette = options.getPaletteOption();
    this.gameColors = paletteSelector.getGameColors();
  }

  updatePalette(paletteName: string, colors: PaletteArray) {
    this.palette = paletteName;
    this.gameColors = colors;
  }

  drawImage(
    image: HTMLImageElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  draw(sx: number, sy: number, sw: number, sh: number, dx: number, dy: number) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    if (!this.palette) {
      browser.showAborted("Unable to render based on game palette.");
      throw new Error("Failed to get a valid palette reference.");
    }

    const gameSprites = sprites.getGameSprites();

    this.ctx.drawImage(
      gameSprites[this.palette],
      sx,
      sy,
      sw,
      sh,
      dx * this.SCALE_FACTOR,
      dy * this.SCALE_FACTOR,
      sw * this.SCALE_FACTOR,
      sh * this.SCALE_FACTOR,
    );
  }

  /**
   * Draws a named region from data/spriteRegions.ts at a logical
   * position. Preferred over draw() wherever the source rectangle is
   * fixed, which is most places; draw() remains for sprites whose
   * position in the sheet is only known at runtime.
   */
  drawSprite(region: SpriteRegion, dx: number, dy: number) {
    this.draw(region.x, region.y, region.w, region.h, dx, dy);
  }

  fillStyle(paletteColor: number) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    if (!this.gameColors) return;

    this.ctx.fillStyle = "#" + this.gameColors[paletteColor];
  }

  /**
   * Draws text in the C64 font at logical coordinates. The
   * default 24px font at the 3x scale factor matches the C64's
   * 8px character height. Text is uppercased by default, matching
   * the original.
   */
  text(
    value: string | number,
    x: number,
    y: number,
    paletteColor: number,
    size = 24,
    upper = true,
  ) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    let output = value.toString();
    if (upper) output = output.toUpperCase();

    this.ctx.font = `${size}px ${CANVAS_FONT}`;
    this.fillStyle(paletteColor);
    this.ctx.fillText(
      output,
      x * this.SCALE_FACTOR,
      y * this.SCALE_FACTOR,
    );
  }

  /**
   * Fills a polygon given logical coordinate pairs, used for the
   * terminal monitor's beveled walls.
   */
  poly(paletteColor: number, coords: [number, number][]) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    this.fillStyle(paletteColor);
    this.ctx.beginPath();

    coords.forEach(([x, y], index) => {
      if (index === 0) {
        this.ctx!.moveTo(x * this.SCALE_FACTOR, y * this.SCALE_FACTOR);
      } else {
        this.ctx!.lineTo(x * this.SCALE_FACTOR, y * this.SCALE_FACTOR);
      }
    });

    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Strokes a line between logical coordinates, used for the
   * organ room's tone cross marks.
   */
  line(
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    lineWidth: number,
    paletteColor: number,
  ) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    if (!this.gameColors) return;

    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = "#" + this.gameColors[paletteColor];
    this.ctx.beginPath();
    this.ctx.moveTo(sx * this.SCALE_FACTOR, sy * this.SCALE_FACTOR);
    this.ctx.lineTo(ex * this.SCALE_FACTOR, ey * this.SCALE_FACTOR);
    this.ctx.stroke();
  }

  /**
   * Strokes an arc (angles in degrees), used for the terminal
   * monitor's rounded corners.
   */
  strokeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    lineWidth: number,
    paletteColor: number,
  ) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    if (!this.gameColors) return;

    this.ctx.strokeStyle = "#" + this.gameColors[paletteColor];
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.arc(
      x * this.SCALE_FACTOR,
      y * this.SCALE_FACTOR,
      radius * this.SCALE_FACTOR,
      startAngle * (Math.PI / 180),
      endAngle * (Math.PI / 180),
    );
    this.ctx.stroke();
  }

  rect(x: number, y: number, w: number, h: number, paletteColor: number) {
    if (!this.ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    this.fillStyle(paletteColor);

    this.ctx.fillRect(
      x * this.SCALE_FACTOR,
      y * this.SCALE_FACTOR,
      w * this.SCALE_FACTOR,
      h * this.SCALE_FACTOR,
    );
  }

  getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      browser.showAborted("Canvas has not been initialized.");
      throw new Error("Canvas has not been initialized.");
    }

    return this.canvas;
  }

  getRenderingContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      browser.showAborted("Unable to render on game canvas.");
      throw new Error("Failed to get 2D rendering context.");
    }

    return ctx;
  }

  private getCanvasById(id: string): HTMLCanvasElement {
    const element = browser.requireElement(id);

    if (!(element instanceof HTMLCanvasElement)) {
      browser.showAborted("Unable to find game canvas.");
      throw new Error(`Unable to initialize ${id} canvas element`);
    }

    return element;
  }
}

export const graphics: Graphics = new Graphics();
