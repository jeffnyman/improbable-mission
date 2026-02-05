import { audio } from "../common/audioManager";
import type { GameOptions } from "../types/options";

const DEFAULT_PALETTE = "vice";
const DEFAULT_SOUND = "on";

class Options {
  private gameOptions: GameOptions = {
    palette: DEFAULT_PALETTE,
    sound: DEFAULT_SOUND,
  };

  constructor() {
    const savedPalette = localStorage.getItem("palette") || DEFAULT_PALETTE;
    this.gameOptions.palette = savedPalette;
    localStorage.setItem("palette", savedPalette);

    const savedSound =
      localStorage.getItem("sound") ||
      (audio.getContext() ? DEFAULT_SOUND : "off");
    this.gameOptions.sound = savedSound;
    localStorage.setItem("sound", savedSound);
  }

  getSoundOption(): string {
    return this.gameOptions.sound;
  }

  getPaletteOption(): string {
    return this.gameOptions.palette;
  }

  setPaletteOption(targetPalette: string) {
    this.gameOptions.palette = targetPalette;
    localStorage.setItem("palette", targetPalette);
  }

  setSoundOption(soundState: string) {
    this.gameOptions.sound = soundState;
    localStorage.setItem("sound", soundState);
  }
}

export const options: Options = new Options();
