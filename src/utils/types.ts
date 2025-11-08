import { palette } from "../data/palette";

export type PaletteKey = keyof typeof palette;

export type ProgressCallback = () => void;
export type PaletteArray = (typeof palette)[PaletteKey];

export interface GameOptions {
  palette: string;
  sound: string;
}
