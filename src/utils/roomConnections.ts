import { layoutManager } from "../common/layoutManager";
import type { RoomConnection } from "../types/layout";

/**
 * Calculates room connections based on the room's position in the
 * layout and its door configuration.
 *
 * @param roomId - The ID of the room (1-32)
 * @param rooms - The room layout in row-major format [level][elevator]
 * @returns Room connection data or null if room is not found
 */
export function calculateRoomConnections(
  roomId: number,
  rooms: number[][],
): RoomConnection | null {
  // Room ID 0 represents "no room" in the layout
  if (roomId === 0) {
    return null;
  }

  // Iterate over levels (rows) in row-major format
  for (let levelIndex = 0; levelIndex < rooms.length; levelIndex++) {
    const level = rooms[levelIndex];
    const elevatorIndex = level.indexOf(roomId);

    if (elevatorIndex !== -1) {
      const connection: RoomConnection = {
        level: levelIndex,
        elevator: elevatorIndex,
      };

      const leftDoorType = layoutManager.hasLeftDoor(roomId);
      const rightDoorType = layoutManager.hasRightDoor(roomId);

      if (leftDoorType) {
        connection.leftDoor = {
          elevator: elevatorIndex,
          position: leftDoorType === 1 ? "top" : "bottom",
        };
      }

      if (rightDoorType) {
        connection.rightDoor = {
          elevator: elevatorIndex + 1,
          position: rightDoorType === 2 ? "top" : "bottom",
        };
      }

      return connection;
    }
  }

  return null;
}
