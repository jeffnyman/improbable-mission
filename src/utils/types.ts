import { palette } from "../data/palette";

export interface GameOptions {
  palette: string;
}

type PaletteKey = keyof typeof palette;
export type PaletteArray = (typeof palette)[PaletteKey];
