export class SoundSelector {
  init() {
    this.setupSoundItems();
  }

  private setupSoundItems() {
    const soundItems = document.querySelectorAll<HTMLElement>(
      ".sound-on, .sound-off",
    );

    soundItems.forEach((item) => {
      item.addEventListener("click", () => {
        const soundState = item.classList.contains("sound-on") ? "on" : "off";

        if (!soundState) return;

        this.setActiveItem(item);
      });
    });
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
