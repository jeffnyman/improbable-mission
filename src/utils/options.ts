import { audio } from "../common/audioManager";
import type { GameOptions } from "../types/options";

const DEFAULT_PALETTE = "vice";
const DEFAULT_SOUND = "on";

const hasLocalStorage = typeof localStorage !== "undefined";

class Options {
  private gameOptions: GameOptions = {
    palette: DEFAULT_PALETTE,
    sound: DEFAULT_SOUND,
  };

  constructor() {
    const savedPalette =
      (hasLocalStorage && localStorage.getItem("palette")) || DEFAULT_PALETTE;
    this.gameOptions.palette = savedPalette;
    if (hasLocalStorage) localStorage.setItem("palette", savedPalette);

    const savedSound =
      (hasLocalStorage && localStorage.getItem("sound")) ||
      (audio.getContext() ? DEFAULT_SOUND : "off");
    this.gameOptions.sound = savedSound;
    if (hasLocalStorage) localStorage.setItem("sound", savedSound);
  }

  getSoundOption(): string {
    return this.gameOptions.sound;
  }

  getPaletteOption(): string {
    return this.gameOptions.palette;
  }

  setPaletteOption(targetPalette: string) {
    this.gameOptions.palette = targetPalette;
    if (hasLocalStorage) localStorage.setItem("palette", targetPalette);
  }

  setSoundOption(soundState: string) {
    this.gameOptions.sound = soundState;
    if (hasLocalStorage) localStorage.setItem("sound", soundState);
  }
}

export const options: Options = new Options();
