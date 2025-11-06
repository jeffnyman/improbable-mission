import { roomDoors } from "../data/layout";

class CheckLayout {
  hasRightDoor(roomId: number) {
    if (roomDoors[roomId].indexOf(2) !== -1) return 2;
    else if (roomDoors[roomId].indexOf(3) !== -1) return 3;
    return false;
  }

  hasLeftDoor(roomId: number) {
    if (roomDoors[roomId].indexOf(1) !== -1) return 1;
    else if (roomDoors[roomId].indexOf(4) !== -1) return 4;
    return false;
  }

  hasRightCorridor(
    elevatorNum: number,
    position: number,
    mapRooms: Record<string, number[]>,
  ) {
    if (position % 216 !== 0) return false;

    const level = Math.floor(position / 216 / 2);
    const doorLevel = (position / 216) % 2 ? "bottom" : "top";
    const rightRooms = mapRooms[elevatorNum];
    let connects = false;

    if (
      rightRooms[level] > 0 &&
      doorLevel === "top" &&
      this.hasLeftDoor(rightRooms[level]) === 1
    ) {
      connects = true;
    }

    if (
      rightRooms[level] > 0 &&
      doorLevel === "bottom" &&
      this.hasLeftDoor(rightRooms[level]) === 4
    ) {
      connects = true;
    }

    return connects;
  }

  hasLeftCorridor(
    elevatorNum: number,
    position: number,
    mapRooms: Record<string, number[]>,
  ) {
    if (position % 216 !== 0) return false;

    const level = Math.floor(position / 216 / 2);
    const doorLevel = (position / 216) % 2 ? "bottom" : "top";
    const leftRooms = mapRooms[elevatorNum - 1];
    let connects = false;

    if (
      leftRooms[level] > 0 &&
      doorLevel === "top" &&
      this.hasRightDoor(leftRooms[level]) === 2
    ) {
      connects = true;
    }

    if (
      leftRooms[level] > 0 &&
      doorLevel === "bottom" &&
      this.hasRightDoor(leftRooms[level]) === 3
    ) {
      connects = true;
    }

    return connects;
  }
}

export const checkLayout = new CheckLayout();
