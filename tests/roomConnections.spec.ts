import { describe, test, expect } from "vitest";
import { calculateRoomConnections } from "../src/utils/roomConnections";

/**
 * Test suite for room connection calculation logic.
 *
 * These tests validate that rooms are correctly positioned in the
 * layout and their door connections to elevator shafts are properly
 * calculated.
 */

describe("calculateRoomConnections", () => {
  // Test map from layout.ts - row-major format
  const testRooms = [
    [27, 25, 20, 0, 3, 16, 8, 9, 0], // Level 0
    [0, 18, 2, 0, 4, 19, 0, 0, 0], // Level 1
    [28, 13, 0, 5, 26, 32, 1, 15, 0], // Level 2
    [10, 29, 0, 14, 21, 0, 23, 0, 0], // Level 3
    [0, 30, 0, 0, 12, 22, 0, 0, 0], // Level 4
    [11, 0, 0, 0, 6, 7, 24, 17, 31], // Level 5
  ];

  describe("Room positioning", () => {
    test("finds room at level 0, elevator 0", () => {
      const connection = calculateRoomConnections(27, testRooms);
      expect(connection).not.toBeNull();
      expect(connection?.level).toBe(0);
      expect(connection?.elevator).toBe(0);
    });

    test("finds room at level 0, elevator 4", () => {
      const connection = calculateRoomConnections(3, testRooms);
      expect(connection).not.toBeNull();
      expect(connection?.level).toBe(0);
      expect(connection?.elevator).toBe(4);
    });

    test("finds room at level 5, elevator 8", () => {
      const connection = calculateRoomConnections(31, testRooms);
      expect(connection).not.toBeNull();
      expect(connection?.level).toBe(5);
      expect(connection?.elevator).toBe(8);
    });

    test("finds room at level 2, elevator 1", () => {
      const connection = calculateRoomConnections(13, testRooms);
      expect(connection).not.toBeNull();
      expect(connection?.level).toBe(2);
      expect(connection?.elevator).toBe(1);
    });

    test("returns null for room 0 (no room)", () => {
      const connection = calculateRoomConnections(0, testRooms);
      expect(connection).toBeNull();
    });

    test("returns null for non-existent room ID", () => {
      const connection = calculateRoomConnections(99, testRooms);
      expect(connection).toBeNull();
    });
  });

  describe("Left door connections", () => {
    test("room with top-left door (type 1) connects to same elevator at top", () => {
      // Room 3 at level 0, elevator 4 - doors: [1, 3]
      const connection = calculateRoomConnections(3, testRooms);
      expect(connection?.leftDoor).toEqual({
        elevator: 4,
        position: "top",
      });
    });

    test("room with bottom-left door (type 4) connects to same elevator at bottom", () => {
      // Room 2 at level 1, elevator 2 - doors: [2, 4]
      const connection = calculateRoomConnections(2, testRooms);
      expect(connection?.leftDoor).toEqual({
        elevator: 2,
        position: "bottom",
      });
    });

    test("room with only right door has no left door connection", () => {
      // Room 1 at level 2, elevator 6 - doors: [3]
      const connection = calculateRoomConnections(1, testRooms);
      expect(connection?.leftDoor).toBeUndefined();
    });

    test("room 6 has top-left door", () => {
      // Room 6 at level 5, elevator 4 - doors: [1]
      const connection = calculateRoomConnections(6, testRooms);
      expect(connection?.leftDoor).toEqual({
        elevator: 4,
        position: "top",
      });
    });
  });

  describe("Right door connections", () => {
    test("room with top-right door (type 2) connects to next elevator at top", () => {
      // Room 8 at level 0, elevator 6 - doors: [1, 2]
      const connection = calculateRoomConnections(8, testRooms);
      expect(connection?.rightDoor).toEqual({
        elevator: 7,
        position: "top",
      });
    });

    test("room with bottom-right door (type 3) connects to next elevator at bottom", () => {
      // Room 27 at level 0, elevator 0 - doors: [3]
      const connection = calculateRoomConnections(27, testRooms);
      expect(connection?.rightDoor).toEqual({
        elevator: 1,
        position: "bottom",
      });
    });

    test("room with only left door has no right door connection", () => {
      // Room 6 at level 5, elevator 4 - doors: [1]
      const connection = calculateRoomConnections(6, testRooms);
      expect(connection?.rightDoor).toBeUndefined();
    });

    test("room 10 has top-right door only", () => {
      // Room 10 at level 3, elevator 0 - doors: [2]
      const connection = calculateRoomConnections(10, testRooms);
      expect(connection?.rightDoor).toEqual({
        elevator: 1,
        position: "top",
      });
      expect(connection?.leftDoor).toBeUndefined();
    });
  });

  describe("Rooms with both doors", () => {
    test("room with both left and right doors has both connections", () => {
      // Room 3 at level 0, elevator 4 - doors: [1, 3]
      const connection = calculateRoomConnections(3, testRooms);
      expect(connection?.leftDoor).toEqual({
        elevator: 4,
        position: "top",
      });
      expect(connection?.rightDoor).toEqual({
        elevator: 5,
        position: "bottom",
      });
    });

    test("room 2 has both top-right and bottom-left doors", () => {
      // Room 2 at level 1, elevator 2 - doors: [2, 4]
      const connection = calculateRoomConnections(2, testRooms);
      expect(connection?.leftDoor).toEqual({
        elevator: 2,
        position: "bottom",
      });
      expect(connection?.rightDoor).toEqual({
        elevator: 3,
        position: "top",
      });
    });

    test("room 8 has both top-left and top-right doors", () => {
      // Room 8 at level 0, elevator 6 - doors: [1, 2]
      const connection = calculateRoomConnections(8, testRooms);
      expect(connection?.leftDoor).toEqual({
        elevator: 6,
        position: "top",
      });
      expect(connection?.rightDoor).toEqual({
        elevator: 7,
        position: "top",
      });
    });
  });

  describe("Edge cases", () => {
    test("room at rightmost position can still have connections", () => {
      // Room 31 at level 5, elevator 8 (rightmost) - doors: [4]
      // Room 31 only has a left door (type 4), no right door
      const connection = calculateRoomConnections(31, testRooms);
      expect(connection?.leftDoor).toEqual({
        elevator: 8,
        position: "bottom",
      });
      expect(connection?.rightDoor).toBeUndefined();
    });

    test("room at leftmost position can have left door", () => {
      // Room 27 at level 0, elevator 0 (leftmost) - doors: [3]
      const connection = calculateRoomConnections(27, testRooms);
      expect(connection?.leftDoor).toBeUndefined();
      expect(connection?.rightDoor).toBeDefined();
    });

    test("handles empty layout", () => {
      const emptyRooms: number[][] = [];
      const connection = calculateRoomConnections(1, emptyRooms);
      expect(connection).toBeNull();
    });

    test("handles layout with no matching room", () => {
      const partialRooms = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const connection = calculateRoomConnections(99, partialRooms);
      expect(connection).toBeNull();
    });
  });

  describe("Full room coverage", () => {
    test("all 32 rooms can be found in the layout", () => {
      const foundRooms = new Set<number>();

      for (let roomId = 1; roomId <= 32; roomId++) {
        const connection = calculateRoomConnections(roomId, testRooms);
        if (connection) {
          foundRooms.add(roomId);
        }
      }

      expect(foundRooms.size).toBe(32);
    });
  });
});
