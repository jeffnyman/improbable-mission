import { palette } from "../data/palette";

export type PaletteKey = keyof typeof palette;

export type ProgressCallback = () => void;
export type PaletteArray = (typeof palette)[PaletteKey];

export interface GameOptions {
  palette: string;
  sound: string;
}

export interface RoomPlatform {
  x: number;
  y: number;
  l: number;
  p: number;
}

export interface InnerLiftData {
  l: number;
  s: number[];
}

export interface FurnitureItemData {
  kind: string;
  l: number;
  b: number;
}

export interface FurnitureProperties {
  x: number;
  y: number;
  w: number;
  h: number;
  s: number;
  r: Record<number, Record<number, number>>;
}

export interface TerminalItemData {
  l: number;
  b: number;
}

export interface OrbEnemyData {
  x: number;
  y: number;
}

export interface RobotEnemyData {
  l: number;
  b: number;
}
