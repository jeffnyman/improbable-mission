interface GameOptions {
  palette: string;
}

const DEFAULT_PALETTE = "vice";

class Options {
  private gameOptions: GameOptions = {
    palette: DEFAULT_PALETTE,
  };

  constructor() {
    const savedPalette = localStorage.getItem("palette") || DEFAULT_PALETTE;
    this.gameOptions.palette = savedPalette;
    localStorage.setItem("palette", savedPalette);
  }

  getPaletteOption(): string {
    return this.gameOptions.palette;
  }

  setPaletteOption(targetPalette: string) {
    this.gameOptions.palette = targetPalette;
    localStorage.setItem("palette", targetPalette);
  }
}

export const options: Options = new Options();
