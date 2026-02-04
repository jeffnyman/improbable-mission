class PaletteSelector {
  init() {
    this.setupPaletteItems();
  }

  private setupPaletteItems() {
    const paletteItems = document.querySelectorAll<HTMLElement>(".palette");

    paletteItems.forEach((item) => {
      item.addEventListener("click", () => {
        const paletteChoice = item.getAttribute("data-palette");

        if (!paletteChoice) return;

        this.setActiveItem(item);
      });
    });
  }

  private setActiveItem(itemClicked: HTMLElement) {
    const container = itemClicked.closest(".item");

    if (!container) return;

    // Remove active from all siblings
    const allItems = container.querySelectorAll(".clickable");
    allItems.forEach((item) => item.classList.remove("active"));

    itemClicked.classList.add("active");
  }
}

export const paletteSelector: PaletteSelector = new PaletteSelector();
