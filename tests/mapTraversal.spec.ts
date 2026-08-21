import { describe, test, expect } from "vitest";

import { maps, roomDoors } from "../src/data/layout";

/**
 * Proves that every room on every map is actually reachable from
 * the game's start position (elevator shaft 1).
 *
 * Movement model, matching the original:
 * - The elevator travels the full height of its shaft, so from a
 *   shaft the agent can enter any adjacent room that has a door
 *   facing that shaft.
 * - Shaft n runs between room column n-1 and room column n, so a
 *   room in column c touches shaft c on its left and shaft c+1 on
 *   its right. Only shafts 1-8 exist; a door facing column edge 0
 *   or 9 faces the tower wall.
 * - Left doors are types 1 (top) and 4 (bottom); right doors are
 *   types 2 (top) and 3 (bottom).
 */

interface RoomPosition {
  level: number;
  column: number;
}

function findRoomPositions(rooms: number[][]): Record<number, RoomPosition> {
  const positions: Record<number, RoomPosition> = {};

  rooms.forEach((row, level) => {
    row.forEach((roomId, column) => {
      if (roomId > 0) positions[roomId] = { level, column };
    });
  });

  return positions;
}

function reachableRooms(rooms: number[][]): Set<number> {
  const positions = findRoomPositions(rooms);

  // Adjacency: shaft number -> room ids touching it via a door.
  const shaftToRooms = new Map<number, number[]>();
  // And the reverse: room id -> shaft numbers its doors open onto.
  const roomToShafts = new Map<number, number[]>();

  for (const [roomIdKey, { column }] of Object.entries(positions)) {
    const roomId = Number(roomIdKey);
    const doors = roomDoors[roomId];
    const shafts: number[] = [];

    const hasLeftDoor = doors.includes(1) || doors.includes(4);
    const hasRightDoor = doors.includes(2) || doors.includes(3);

    if (hasLeftDoor && column >= 1 && column <= 8) shafts.push(column);
    if (hasRightDoor && column + 1 >= 1 && column + 1 <= 8)
      shafts.push(column + 1);

    roomToShafts.set(roomId, shafts);
    for (const shaft of shafts) {
      shaftToRooms.set(shaft, [...(shaftToRooms.get(shaft) ?? []), roomId]);
    }
  }

  // BFS starting from shaft 1, alternating shaft -> rooms -> shafts.
  const visitedShafts = new Set<number>([1]);
  const visitedRooms = new Set<number>();
  const shaftQueue = [1];

  while (shaftQueue.length > 0) {
    const shaft = shaftQueue.shift() as number;

    for (const roomId of shaftToRooms.get(shaft) ?? []) {
      if (visitedRooms.has(roomId)) continue;
      visitedRooms.add(roomId);

      for (const nextShaft of roomToShafts.get(roomId) ?? []) {
        if (!visitedShafts.has(nextShaft)) {
          visitedShafts.add(nextShaft);
          shaftQueue.push(nextShaft);
        }
      }
    }
  }

  return visitedRooms;
}

describe("map traversal", () => {
  test("every door on every map opens onto a real shaft, not the tower wall", () => {
    maps.forEach((map, mapId) => {
      const positions = findRoomPositions(map.rooms);

      for (const [roomIdKey, { column }] of Object.entries(positions)) {
        const roomId = Number(roomIdKey);
        const doors = roomDoors[roomId];

        if (doors.includes(1) || doors.includes(4)) {
          expect(column, `map ${mapId}: room ${roomId} left door`).toBeGreaterThanOrEqual(1);
        }
        if (doors.includes(2) || doors.includes(3)) {
          expect(column, `map ${mapId}: room ${roomId} right door`).toBeLessThanOrEqual(7);
        }
      }
    });
  });

  test("all 32 rooms are reachable from the starting shaft on every map", () => {
    maps.forEach((map, mapId) => {
      const reached = reachableRooms(map.rooms);

      const missing = [];
      for (let roomId = 1; roomId <= 32; roomId++) {
        if (!reached.has(roomId)) missing.push(roomId);
      }

      expect(missing, `map ${mapId}: unreachable rooms`).toEqual([]);
    });
  });
});
