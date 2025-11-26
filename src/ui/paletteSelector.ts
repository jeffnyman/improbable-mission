import { browser } from "../utils/browser";
import { options } from "../utils/options";
import { palette } from "../data/palette";
import type { PaletteArray } from "../utils/types";

export class PaletteSelector {
  private gameColors: PaletteArray | null = null;

  init() {
    this.setupPaletteItems();
  }

  getGameColors() {
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

    const paletteItem = document.querySelector(
      `.palette[data-palette="${options.getPaletteOption()}"]`,
    ) as HTMLElement;

    if (paletteItem) {
      this.applyPalette(options.getPaletteOption());
      this.setActiveItem(paletteItem);
    }
  }

  private applyPalette(paletteName: string) {
    const colors = (palette as Record<string, string[]>)[paletteName];

    if (!colors) return;

    this.gameColors = colors;

    browser.requireElement("app").style.background = "#" + this.gameColors[0];
  }

  private setActiveItem(itemClicked: HTMLElement) {
    const container = itemClicked.closest(".item");

    if (!container) {
      console.warn("Clicked item is not within an .item container.");
      return;
    }

    // Remove active from all siblings
    const allItems = container.querySelectorAll(".clickable");
    allItems.forEach((item) => item.classList.remove("active"));

    itemClicked.classList.add("active");
  }
}
