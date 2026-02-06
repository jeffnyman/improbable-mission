export interface RoomColor {
  bg: number;
}

export interface RoomConnection {
  level: number;
  elevator: number;
  leftDoor?: {
    elevator: number;
    position: "top" | "bottom";
  };
  rightDoor?: {
    elevator: number;
    position: "top" | "bottom";
  };
}
