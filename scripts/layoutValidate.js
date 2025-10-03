import * as Layout from "./layout";
import { roomDoors } from "./layout";

export class LayoutValidator {
  validateAllMaps() {
    const results = [];

    for (let mapIndex = 0; mapIndex < Layout.maps.length; mapIndex++) {
      const mapResult = this.validateMap(mapIndex);
      results.push(mapResult);
    }

    return results;
  }

  validateMap(mapIndex) {
    const map = Layout.maps[mapIndex];
    const errors = [];
    const warnings = [];

    console.log(`\n=== Validating Map ${mapIndex} ===`);

    // Track which rooms we've seen
    const seenRooms = new Set();

    // Check each column
    for (let col = 0; col < 9; col++) {
      const column = map.rooms[col];

      if (!column || column.length !== 6) {
        errors.push(
          `Map ${mapIndex}, Column ${col}: Invalid column (expected 6 floors)`,
        );
        continue;
      }

      // Check each floor in this column
      for (let floor = 0; floor < 6; floor++) {
        const roomId = column[floor];

        // Skip empty spaces
        if (roomId === 0) continue;

        // Check for valid room ID
        if (roomId < 1 || roomId > 32) {
          errors.push(
            `Map ${mapIndex}, Column ${col}, Floor ${floor}: Invalid room ID ${roomId}`,
          );
          continue;
        }

        // Check for duplicate rooms
        if (seenRooms.has(roomId)) {
          errors.push(`Map ${mapIndex}: Room ${roomId} appears multiple times`);
          continue;
        }
        seenRooms.add(roomId);

        // Validate doors for this room
        const doorErrors = this.validateRoomDoors(mapIndex, roomId, col, floor);
        errors.push(...doorErrors);
      }
    }

    // Check that all 32 rooms are present
    for (let roomId = 1; roomId <= 32; roomId++) {
      if (!seenRooms.has(roomId)) {
        warnings.push(`Map ${mapIndex}: Room ${roomId} is missing from layout`);
      }
    }

    const result = {
      mapIndex,
      isValid: errors.length === 0,
      errors,
      warnings,
      roomCount: seenRooms.size,
    };

    this.printMapResult(result);
    return result;
  }

  validateRoomDoors(mapIndex, roomId, col, floor) {
    const errors = [];
    const doors = roomDoors[roomId];

    if (!doors) {
      errors.push(`Map ${mapIndex}, Room ${roomId}: No door data found`);
      return errors;
    }

    // Check for contradictory doors
    const leftDoorTypes = doors.filter((d) => d === 1 || d === 4);
    const rightDoorTypes = doors.filter((d) => d === 2 || d === 3);

    if (leftDoorTypes.length > 1) {
      errors.push(
        `Map ${mapIndex}, Room ${roomId}: Multiple left door types ${leftDoorTypes.join(", ")}`,
      );
    }

    if (rightDoorTypes.length > 1) {
      errors.push(
        `Map ${mapIndex}, Room ${roomId}: Multiple right door types ${rightDoorTypes.join(", ")}`,
      );
    }

    // Check for invalid door combinations
    const allDoorTypes = new Set(doors);
    if (allDoorTypes.has(1) && allDoorTypes.has(4)) {
      errors.push(
        `Map ${mapIndex}, Room ${roomId} at (${col}, ${floor}): Has both door types 1 and 4 (both are left doors)`,
      );
    }
    if (allDoorTypes.has(2) && allDoorTypes.has(3)) {
      errors.push(
        `Map ${mapIndex}, Room ${roomId} at (${col}, ${floor}): Has both door types 2 and 3 (both are right doors)`,
      );
    }

    return errors;
  }

  printMapResult(result) {
    if (result.isValid && result.warnings.length === 0) {
      console.log(
        `✓ Map ${result.mapIndex} is valid (${result.roomCount} rooms)`,
      );
    } else {
      console.log(`\nMap ${result.mapIndex} Results:`);
      console.log(`  Rooms found: ${result.roomCount}/32`);

      if (result.errors.length > 0) {
        console.log(`  ✗ Errors: ${result.errors.length}`);
        result.errors.forEach((err) => console.log(`    - ${err}`));
      } else {
        console.log(`  ✓ No errors`);
      }

      if (result.warnings.length > 0) {
        console.log(`  ⚠ Warnings: ${result.warnings.length}`);
        result.warnings.forEach((warn) => console.log(`    - ${warn}`));
      }
    }
  }

  printSummary(results) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`VALIDATION SUMMARY`);
    console.log(`${"=".repeat(50)}`);

    const validMaps = results.filter(
      (r) => r.isValid && r.warnings.length === 0,
    );
    const mapsWithWarnings = results.filter(
      (r) => r.isValid && r.warnings.length > 0,
    );
    const invalidMaps = results.filter((r) => !r.isValid);

    console.log(`Total maps: ${results.length}`);
    console.log(`✓ Valid: ${validMaps.length}`);
    console.log(`⚠ Valid with warnings: ${mapsWithWarnings.length}`);
    console.log(`✗ Invalid: ${invalidMaps.length}`);

    if (invalidMaps.length > 0) {
      console.log(
        `\nInvalid maps: ${invalidMaps.map((m) => m.mapIndex).join(", ")}`,
      );
    }
  }
}
