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
}

type PaletteKey = keyof typeof palette;
export type PaletteArray = (typeof palette)[PaletteKey];
