import { describe, test, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
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
import { palette } from "../src/data/palette";
import {
  runBoundaryAdjustments,
  jumpBoundaryAdjustments,
  platformObstacleCheckForJump,
} from "../src/data/agentPhysics";

/**
 * Verifies this project's data tables against the original
 * implementation (imp1_fixed constants.js), which is the ground
 * truth for the port. The suite is skipped automatically when the
 * original is not present (e.g. in CI) — the CI-safe invariants
 * live in layoutIntegrity.spec.ts.
 */

const here = dirname(fileURLToPath(import.meta.url));
const originalDir =
  process.env.ORIGINAL_GAME_DIR ?? resolve(here, "../../imp1_fixed");
const constantsPath = resolve(originalDir, "js/v1.0a/constants.js");

function loadOriginal() {
  const source = readFileSync(constantsPath, "utf8");
  const loader = new Function(
    "Image",
    `${source}
    return { palette, roomColors, roomDoors, roomPlatforms, roomFurnitures,
      roomTerminals, innerLifts, furnitureProperties, blackBalls, droidTypes,
      droidProperties, elevatorColors, maps, passwords,
      correctRun, correctJump, platformObstacleCheckForJump };`,
  );
  return loader(class {});
}

const hasOriginal = existsSync(constantsPath);

describe.skipIf(!hasOriginal)("parity with original constants.js", () => {
  // skipIf stops the tests from running, but it does not stop this
  // callback: vitest still executes it to collect the test names. So
  // the read has to be guarded separately, or the whole file throws at
  // collection time on any machine without the original — which is
  // every CI runner.
  const original = hasOriginal ? loadOriginal() : {};

  test("palettes match (original 'sprite' is our 'source'; 'colodore' is our addition)", () => {
    const lower = (colors: string[]) => colors.map((c) => c.toLowerCase());

    expect(lower(palette.source)).toEqual(lower(original.palette.sprite));
    for (const name of ["vice", "ccs64", "c64hq", "pc64", "c64s"] as const) {
      expect(lower(palette[name])).toEqual(lower(original.palette[name]));
    }
  });

  test("roomColors match, including lift and robot colors", () => {
    expect(roomColors).toEqual(original.roomColors);
  });

  test("roomDoors match", () => {
    expect(roomDoors).toEqual(original.roomDoors);
  });

  test("roomPlatforms match", () => {
    expect(roomPlatforms).toEqual(original.roomPlatforms);
  });

  test("innerLifts match", () => {
    expect(innerLifts).toEqual(original.innerLifts);
  });

  test("furniture placements match (original 'type' is our 'kind')", () => {
    const translated: Record<number, { kind: string; l: number; b: number }[]> = {};
    for (const [roomId, items] of Object.entries(original.roomFurnitures)) {
      translated[Number(roomId)] = (
        items as { type: string; l: number; b: number }[]
      ).map(({ type, l, b }) => ({ kind: type, l, b }));
    }
    expect(roomFurnitureItems).toEqual(translated);
  });

  test("furnitureProperties match", () => {
    expect(furnitureProperties).toEqual(original.furnitureProperties);
  });

  test("terminal placements match", () => {
    expect(roomTerminalItems).toEqual(original.roomTerminals);
  });

  test("orb start positions match original blackBalls", () => {
    expect(orbEnemies).toEqual(original.blackBalls);
  });

  test("robot start positions match original droidProperties", () => {
    expect(robotEnemies).toEqual(original.droidProperties);
  });

  test("robot type names match original droidTypes", () => {
    expect(robotTypes).toEqual(original.droidTypes);
  });

  test("elevatorColors match", () => {
    expect(elevatorColors).toEqual(original.elevatorColors);
  });

  test("all 11 maps match (ours are the transpose of the original's column-major rooms)", () => {
    expect(maps.length).toBe(original.maps.length);

    maps.forEach((map, mapId) => {
      const originalMap = original.maps[mapId];

      for (let level = 0; level < 6; level++) {
        for (let column = 0; column < 9; column++) {
          expect(
            map.rooms[level][column],
            `map ${mapId}, level ${level}, column ${column}`,
          ).toBe(originalMap.rooms[column][level]);
        }
      }

      expect(map.elevators, `map ${mapId} elevators`).toEqual(
        originalMap.elevators,
      );
    });
  });

  test("passwords match, aligned to 0-based map ids", () => {
    expect(passwords).toEqual(original.passwords);
  });

  test("agent physics tables match original correctRun/correctJump", () => {
    expect(runBoundaryAdjustments).toEqual(original.correctRun);
    expect(jumpBoundaryAdjustments).toEqual(original.correctJump);
    expect(platformObstacleCheckForJump).toEqual(
      original.platformObstacleCheckForJump,
    );
  });
});
