import { describe, test, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  maps,
  passwords,
  robotTypes,
  elevatorColors,
  roomDoors,
  roomColors,
  roomPlatforms,
  innerLifts,
  roomFurnitureItems,
  furnitureProperties,
  roomTerminalItems,
  orbEnemies,
  robotEnemies,
} from "../src/data/layout";
import { originalAudioNames, originalAudioPath } from "../src/data/audioManifest";

/**
 * Structural invariants of the game data. Unlike
 * originalParity.spec.ts, these need no external reference and
 * always run, including in CI.
 */

const ROOM_IDS = Array.from({ length: 32 }, (_, i) => i + 1);

function numericKeys(table: Record<number, unknown>) {
  return Object.keys(table).map(Number);
}

describe("maps", () => {
  test("there are 11 maps", () => {
    expect(maps.length).toBe(11);
  });

  test("every map is 6 levels by 9 columns", () => {
    for (const map of maps) {
      expect(map.rooms.length).toBe(6);
      for (const row of map.rooms) {
        expect(row.length).toBe(9);
      }
    }
  });

  test("every map places each of the 32 rooms exactly once", () => {
    maps.forEach((map, mapId) => {
      const placed = map.rooms.flat().filter((roomId) => roomId !== 0);
      expect(placed.length, `map ${mapId}`).toBe(32);
      expect([...placed].sort((a, b) => a - b), `map ${mapId}`).toEqual(ROOM_IDS);
    });
  });

  test("every map has sane extents for all 8 elevator shafts", () => {
    maps.forEach((map, mapId) => {
      expect(numericKeys(map.elevators)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      for (const { top, bottom } of Object.values(map.elevators)) {
        expect(top, `map ${mapId}`).toBeGreaterThanOrEqual(0);
        expect(bottom, `map ${mapId}`).toBeGreaterThan(top);
        expect(bottom, `map ${mapId}`).toBeLessThanOrEqual(6);
      }
    });
  });
});

describe("passwords", () => {
  test("there is one password per map", () => {
    expect(passwords.length).toBe(maps.length);
  });

  test("every password is nine uppercase letters", () => {
    for (const password of passwords) {
      expect(password).toMatch(/^[A-Z]{9}$/);
    }
  });
});

describe("per-room tables", () => {
  test("every table covers exactly rooms 1-32", () => {
    for (const table of [
      roomColors,
      roomPlatforms,
      innerLifts,
      roomFurnitureItems,
      roomTerminalItems,
      robotEnemies,
    ]) {
      expect(numericKeys(table).sort((a, b) => a - b)).toEqual(ROOM_IDS);
    }
  });

  test("roomDoors has a dummy entry plus one entry per room", () => {
    expect(roomDoors.length).toBe(33);
    expect(roomDoors[0]).toEqual([0]);
    for (const doors of roomDoors.slice(1)) {
      expect(doors.length).toBeGreaterThanOrEqual(1);
      expect(doors.length).toBeLessThanOrEqual(2);
      for (const door of doors) {
        expect([1, 2, 3, 4]).toContain(door);
      }
    }
  });

  test("platforms stay inside the 40x25 room grid", () => {
    for (const platforms of Object.values(roomPlatforms)) {
      for (const { x, y, l } of platforms) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x + l).toBeLessThanOrEqual(40);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(24);
      }
    }
  });

  test("furniture, terminals, and robots stay inside the room grid", () => {
    const placements = [
      ...Object.values(roomFurnitureItems).flat(),
      ...Object.values(roomTerminalItems).flat(),
      ...Object.values(robotEnemies).flat(),
    ];
    for (const { l, b } of placements) {
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(39);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(24);
    }
  });

  test("every furniture kind has sprite properties", () => {
    const kinds = Object.keys(furnitureProperties);
    for (const items of Object.values(roomFurnitureItems)) {
      for (const { kind } of items) {
        expect(kinds).toContain(kind);
      }
    }
  });

  test("orbs are placed in valid rooms", () => {
    for (const roomId of numericKeys(orbEnemies)) {
      expect(ROOM_IDS).toContain(roomId);
    }
  });
});

describe("misc tables", () => {
  test("elevatorColors covers all 8 shafts", () => {
    expect(numericKeys(elevatorColors)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test("there are 12 robot behavior types", () => {
    expect(robotTypes.length).toBe(12);
  });
});

describe("audio manifest", () => {
  test("lists all 42 sounds without duplicates", () => {
    expect(originalAudioNames.length).toBe(42);
    expect(new Set(originalAudioNames).size).toBe(42);
  });

  test("every manifest entry has a committed file", () => {
    const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), "../public");
    for (const name of originalAudioNames) {
      const filePath = resolve(publicDir, `.${originalAudioPath(name)}`);
      expect(existsSync(filePath), `${name}.ogg`).toBe(true);
    }
  });
});
