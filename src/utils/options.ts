import type { GameOptions } from "./types";

class Options {
  private gameOptions: GameOptions = {
    palette: "vice",
  };

  constructor() {
    if (localStorage.getItem("palette") === null) {
      localStorage.setItem("palette", "vice");
    }

    const savedPalette = localStorage.getItem("palette");

    if (savedPalette) {
      this.gameOptions.palette = savedPalette;
    }
  }

  getPaletteOption() {
    return this.gameOptions.palette;
  }

  setPaletteOption(targetPalette: string) {
    this.gameOptions.palette = targetPalette;
    localStorage.setItem("palette", targetPalette);
  }
}

export const options: Options = new Options();
