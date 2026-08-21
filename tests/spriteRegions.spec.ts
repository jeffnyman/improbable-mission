import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import * as regions from "../src/data/spriteRegions";
import { roomColors } from "../src/data/layout";
import type { SpriteRegion } from "../src/types/sprites";

/**
 * Guards the named sprite regions against the sheet they index into.
 *
 * This cannot tell whether a region is pointing at the *right* sprite —
 * only the canvas snapshots in tests/visual can do that. What it does
 * catch is a region that has drifted off the sheet, been given a
 * nonsense size, or stopped covering the data it is keyed against, all
 * of which are the likely typos when editing a table of coordinates.
 */

const here = dirname(fileURLToPath(import.meta.url));
const sheetPath = resolve(here, "../public/images/sprites.png");

function isRegion(value: unknown): value is SpriteRegion {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.x === "number" &&
    typeof r.y === "number" &&
    typeof r.w === "number" &&
    typeof r.h === "number"
  );
}

/** Every exported region, including the ones inside frame arrays. */
function allRegions(): [string, SpriteRegion][] {
  const found: [string, SpriteRegion][] = [];

  for (const [name, value] of Object.entries(regions)) {
    if (isRegion(value)) {
      found.push([name, value]);
    } else if (Array.isArray(value)) {
      value.forEach((entry, i) => {
        if (isRegion(entry)) found.push([`${name}[${i}]`, entry]);
      });
    } else if (value && typeof value === "object") {
      for (const [key, entry] of Object.entries(value)) {
        if (isRegion(entry)) found.push([`${name}[${key}]`, entry]);
      }
    }
  }

  return found;
}

describe("sprite regions", () => {
  test("the declared sheet size matches sprites.png itself", () => {
    // PNG puts width and height in the IHDR chunk, at a fixed offset.
    const png = readFileSync(sheetPath);

    expect(png.readUInt32BE(16)).toBe(regions.SPRITE_SHEET_SIZE.w);
    expect(png.readUInt32BE(20)).toBe(regions.SPRITE_SHEET_SIZE.h);
  });

  test("every region sits inside the sheet", () => {
    const { w: sheetW, h: sheetH } = regions.SPRITE_SHEET_SIZE;

    for (const [name, r] of allRegions()) {
      expect(r.x, `${name} x`).toBeGreaterThanOrEqual(0);
      expect(r.y, `${name} y`).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w, `${name} right edge`).toBeLessThanOrEqual(sheetW);
      expect(r.y + r.h, `${name} bottom edge`).toBeLessThanOrEqual(sheetH);
    }
  });

  test("no region is empty or inverted", () => {
    for (const [name, r] of allRegions()) {
      expect(r.w, `${name} width`).toBeGreaterThan(0);
      expect(r.h, `${name} height`).toBeGreaterThan(0);
    }
  });

  test("it found the regions at all, so the checks above mean something", () => {
    // Cheap insurance: if the reflection above ever stops matching the
    // module's shape, the two tests before this would pass vacuously.
    expect(allRegions().length).toBeGreaterThan(25);
  });

  test("runtime-positioned sprites have a usable size", () => {
    for (const [name, size] of [
      ["agent", regions.AGENT_FRAME_SIZE],
      ["robot", regions.ROBOT_FRAME_SIZE],
      ["zap beam", regions.ZAP_BEAM_SIZE],
    ] as const) {
      expect(size.w, `${name} width`).toBeGreaterThan(0);
      expect(size.h, `${name} height`).toBeGreaterThan(0);
    }
  });

  test("every zap beam flicker variant stays on the sheet", () => {
    const { w: sheetW, h: sheetH } = regions.SPRITE_SHEET_SIZE;
    const xs = [
      ...regions.ZAP_BEAM_FLICKER_X,
      ...regions.ZAP_BEAM_FLICKER_X.map(
        (x) => x + regions.ZAP_BEAM_VARIANT_OFFSET,
      ),
      regions.ZAP_BEAM_KILL_X,
    ];

    for (const x of xs) {
      expect(x + regions.ZAP_BEAM_SIZE.w, `beam at x=${x}`).toBeLessThanOrEqual(
        sheetW,
      );
    }

    expect(
      regions.ZAP_BEAM_ROW + regions.ZAP_BEAM_SIZE.h,
    ).toBeLessThanOrEqual(sheetH);
    expect(
      regions.ROBOT_FRAME_ROW + regions.ROBOT_FRAME_SIZE.h,
    ).toBeLessThanOrEqual(sheetH);
  });

  test("the search signs cover every room background color in use", () => {
    const backgrounds = new Set(
      Object.values(roomColors).map((color) => color.bg),
    );

    expect(backgrounds.size).toBeGreaterThan(0);

    for (const bg of backgrounds) {
      expect(
        regions.SNOOZE_SIGN_BY_ROOM_BG[bg],
        `snooze sign for room background ${bg}`,
      ).toBeDefined();
      expect(
        regions.LIFT_INIT_SIGN_BY_ROOM_BG[bg],
        `lift init sign for room background ${bg}`,
      ).toBeDefined();
    }
  });

  test("the sign fallback is itself a real variant", () => {
    expect(
      regions.SNOOZE_SIGN_BY_ROOM_BG[regions.SIGN_FALLBACK_ROOM_BG],
    ).toBeDefined();
    expect(
      regions.LIFT_INIT_SIGN_BY_ROOM_BG[regions.SIGN_FALLBACK_ROOM_BG],
    ).toBeDefined();
  });
});
