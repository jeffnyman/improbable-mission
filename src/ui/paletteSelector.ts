import { browser } from "../utils/browser";
import { palette } from "../data/palette";

export class PaletteSelector {
  init() {
    this.setupPaletteItems();
  }

  private setupPaletteItems() {
    const paletteItems = document.querySelectorAll<HTMLElement>(".palette");

    paletteItems.forEach((item) => {
      item.addEventListener("click", () => {
        const paletteChoice = item.getAttribute("data-palette");

        if (!paletteChoice) return;

        this.applyPalette(paletteChoice);
        this.setActiveItem(item);
      });
    });
  }

  private applyPalette(paletteName: string) {
    const colors = (palette as Record<string, string[]>)[paletteName];

    if (!colors) return;

    browser.requireElement("app").style.background = "#" + colors[0];
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
