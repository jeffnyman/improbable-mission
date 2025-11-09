import { checkLayout } from "../utils/checkLayout";
import {
  roomColors,
  roomPlatforms,
  roomFurnitureItems,
  innerLifts,
} from "../data/layout";
import { graphics } from "../utils/graphics";
import type {
  RoomPlatform,
  InnerLiftData,
  FurnitureItemData,
} from "../utils/types";
import { InnerLift } from "./innerLift";
import { Furniture } from "./furniture";

export class Room {
  // This is the id of the room, which can run from 1 to 32.
  private roomId: number;

  // This is the elevator level, which can run from 1 to 6.
  // A value of -1 means no elevator level.
  private floorLevel = -1;

  // These refer to the left and right side elevator numbers.
  // The values can run from 1 to 8. A value of 0 indicates
  // that there is no elevator to the left or right.
  private elevatorLeft = 0;
  private elevatorRight = 0;

  // These refer to the location of the door out of the room,
  // in terms of whether it is at the top or bottom of the
  // room.
  // @ts-expect-error - currently used for debugging
  private leftDoorPosition = "";
  // @ts-expect-error - currently used for debugging
  private rightDoorPosition = "";

  // A room is revealed when the agent enters it.
  // This acts as a flag for the pocket computer map.
  private revealed = false;

  // Holds all the inner lift objects for the room.
  private liftGroups: InnerLift[] = [];

  // Holds all the furniture objects for the room.
  private furnitureItems: Furniture[] = [];

  // Base sprite image for furniture rendering.
  private gameSprites!: HTMLImageElement;

  // Current palette name for color rendering.
  private paletteName!: string;

  constructor(roomId: number) {
    this.roomId = roomId;
  }

  init(
    mapRooms: Record<string, number[]>,
    gameSprites: HTMLImageElement,
    paletteName: string,
  ) {
    this.gameSprites = gameSprites;
    this.paletteName = paletteName;
    this.setupRoomConnections(mapRooms);
    this.setupInnerLifts();
    this.setupFurnitureItems();
  }

  getElevatorLeft() {
    return this.elevatorLeft;
  }

  getElevatorRight() {
    return this.elevatorRight;
  }

  getFloorLevel() {
    return this.floorLevel;
  }

  scanRoutine() {
    // LOGIC GOES HERE EVENTUALLY
  }

  animationRoutine() {
    const bg = roomColors[this.roomId].bg;
    const platforms: RoomPlatform[] = (
      roomPlatforms as Record<number, RoomPlatform[]>
    )[this.roomId];

    // Show the room background.
    graphics.rect(0, 0, 320, 200, bg);

    // Draw the room borders.
    for (let i = 0; i < 25; i++) {
      graphics.draw(344, 200, 8, 8, 0, 0 + i * 8);
      graphics.draw(352, 200, 8, 8, 312, 0 + i * 8);
    }

    // Cut out the doors from the borders.
    if (checkLayout.hasLeftDoor(this.roomId) === 1) {
      graphics.rect(0, 8, 8, 40, bg);
    }

    if (checkLayout.hasLeftDoor(this.roomId) === 4) {
      graphics.rect(0, 152, 8, 48, bg);
    }

    if (checkLayout.hasRightDoor(this.roomId) === 2) {
      graphics.rect(312, 8, 8, 40, bg);
    }

    if (checkLayout.hasRightDoor(this.roomId) === 3) {
      graphics.rect(312, 152, 8, 48, bg);
    }

    // Draw the platforms.
    for (const platform of platforms) {
      for (let segment = 0; segment < platform.l; segment++) {
        let spriteX = 344;

        if (platform.p && segment % 2) spriteX = 352;
        if (!platform.p && !(segment % 2)) spriteX = 352;

        graphics.draw(
          spriteX,
          208,
          8,
          8,
          platform.x * 8 + segment * 8,
          platform.y * 8,
        );
      }
    }

    // Draw the inner lifts.
    for (const lift of this.liftGroups) {
      lift.animationRoutine();
    }

    // Draw the furniture items.
    for (const furnitureItem of this.furnitureItems) {
      furnitureItem.draw();
    }
  }

  setRevealed(value: boolean) {
    this.revealed = value;
  }

  setupFurnitureItems() {
    const items: FurnitureItemData[] = (
      roomFurnitureItems as Record<number, FurnitureItemData[]>
    )[this.roomId];

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      this.furnitureItems[i] = new Furniture(
        this.roomId,
        item.kind,
        item.l,
        item.b,
        this.gameSprites,
        this.paletteName,
      );

      this.furnitureItems[i].init();
    }
  }

  setupInnerLifts() {
    const lifts: InnerLiftData[] = (
      innerLifts as Record<number, InnerLiftData[]>
    )[this.roomId];

    if (!lifts) return;

    for (let i = 0; i < lifts.length; i++) {
      const lift = lifts[i];
      this.liftGroups[i] = new InnerLift(this.roomId, lift.l);
      this.liftGroups[i].init(lift.s);
    }
  }

  setupRoomConnections(mapRooms: Record<string, number[]>) {
    for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
      const column = mapRooms[columnIndex];
      const floorIndex = column.indexOf(this.roomId);

      if (floorIndex !== -1) {
        console.log(
          `Room ${this.roomId} is at column ${columnIndex}, floor ${floorIndex}`,
        ); // REMOVE

        this.floorLevel = floorIndex;

        const leftDoorType = checkLayout.hasLeftDoor(this.roomId);
        const rightDoorType = checkLayout.hasRightDoor(this.roomId);

        if (leftDoorType) {
          this.elevatorLeft = columnIndex;
          this.leftDoorPosition = leftDoorType === 1 ? "top" : "bottom";
        }

        if (rightDoorType) {
          this.elevatorRight = columnIndex + 1;
          this.rightDoorPosition = rightDoorType === 2 ? "top" : "bottom";
        }

        break;
      }
    }
  }

  isRevealed() {
    return this.revealed;
  }
}
