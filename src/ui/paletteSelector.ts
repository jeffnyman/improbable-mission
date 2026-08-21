import { browser } from "../utils/browser";
import { graphics } from "../utils/graphics";
import { options } from "../utils/options";
import { palette } from "../data/palette";
import type { PaletteArray } from "../types/palette";

class PaletteSelector {
  private gameColors: PaletteArray | null = null;

  init() {
    this.setupPaletteItems();
  }

  getGameColors(): PaletteArray | null {
    return this.gameColors;
  }

  private setupPaletteItems() {
    const paletteItems = document.querySelectorAll<HTMLElement>(".palette");

    paletteItems.forEach((item) => {
      item.addEventListener("click", () => {
        const paletteChoice = item.getAttribute("data-palette");

        if (!paletteChoice) return;

        options.setPaletteOption(paletteChoice);
        this.applyPalette(paletteChoice);
        this.setActiveItem(item);
      });
    });

    const savedPalette = options.getPaletteOption();

    const paletteItem = document.querySelector(
      `.palette[data-palette="${savedPalette}"]`,
    ) as HTMLElement;

    if (paletteItem) {
      this.applyPalette(savedPalette);
      this.setActiveItem(paletteItem);
    }
  }

  private setActiveItem(itemClicked: HTMLElement) {
    const container = itemClicked.closest(".item");

    if (!container) return;

    // Remove active from all siblings
    const allItems = container.querySelectorAll(".clickable");
    allItems.forEach((item) => item.classList.remove("active"));

    itemClicked.classList.add("active");
  }

  private applyPalette(paletteName: string) {
    const colors = (palette as Record<string, string[]>)[paletteName];

    if (!colors) return;

    this.gameColors = colors;
    graphics.updatePalette(paletteName, colors);

    browser.requireElement("app").style.background = "#" + this.gameColors[0];
  }
}

export const paletteSelector: PaletteSelector = new PaletteSelector();
