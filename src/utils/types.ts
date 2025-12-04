import { palette } from "../data/palette";

export interface AudioRequest {
  name: string;
}

export interface ActiveSound {
  name: string;
  bufferSource: AudioBufferSourceNode | false;
}

export interface GameOptions {
  palette: string;
  sound: string;
}

type PaletteKey = keyof typeof palette;
export type PaletteArray = (typeof palette)[PaletteKey];

// Agent Types

export type ActionType = "stand" | "run" | "jump";

interface AnimationFrame {
  x: number;
  y: number;
}

interface DirectionAnimations {
  stand: AnimationFrame[];
  run: AnimationFrame[];
  jump: AnimationFrame[];
}

export interface Animation {
  left: DirectionAnimations;
  right: DirectionAnimations;
}

// Layout Types

export interface RoomColor {
  bg: number;
}
