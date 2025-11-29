import type { GameOptions } from "./types";
import { audio } from "../components/audio";

class Options {
  private gameOptions: GameOptions = {
    palette: "vice",
    sound: "on",
  };

  constructor() {
    if (localStorage.getItem("palette") === null) {
      localStorage.setItem("palette", "vice");
    }

    const savedPalette = localStorage.getItem("palette");

    if (savedPalette) {
      this.gameOptions.palette = savedPalette;
    }

    if (!audio.getContext()) {
      localStorage.setItem("sound", "off");
      this.gameOptions.sound = "off";
    } else if (localStorage.getItem("sound") === null) {
      localStorage.setItem("sound", "on");
    }

    const savedSound = localStorage.getItem("sound");

    if (savedSound) {
      this.gameOptions.sound = savedSound;
    }
  }

  getPaletteOption() {
    return this.gameOptions.palette;
  }

  getSoundOption() {
    return this.gameOptions.sound;
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
