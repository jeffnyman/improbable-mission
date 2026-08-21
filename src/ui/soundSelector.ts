import { audio } from "../common/audioManager";
import { options } from "../utils/options";

class SoundSelector {
  init() {
    this.setupSoundItems();
  }

  private setupSoundItems() {
    const soundItems = document.querySelectorAll<HTMLElement>(
      ".sound-on, .sound-off",
    );

    // If audio is not available, disable the sound controls
    if (!audio.isAvailable()) {
      this.disableSoundControls(soundItems);
      return;
    }

    soundItems.forEach((item) => {
      item.addEventListener("click", () => {
        const soundState = item.classList.contains("sound-on") ? "on" : "off";

        if (!soundState) return;

        options.setSoundOption(soundState);
        this.applySoundState(soundState);
        this.setActiveItem(item);
      });
    });

    const soundState = options.getSoundOption();
    const soundItem = document.querySelector(
      `.sound-${soundState}`,
    ) as HTMLElement;

    if (soundItem) {
      this.applySoundState(soundState);
      this.setActiveItem(soundItem);
    }
  }

  private disableSoundControls(soundItems: NodeListOf<HTMLElement>) {
    soundItems.forEach((item) => {
      item.style.textDecoration = "line-through";
      item.style.opacity = "0.4";
      item.style.cursor = "not-allowed";
      item.style.pointerEvents = "none";
      item.title = "Audio not supported in this browser";
    });
  }

  private applySoundState(state: string) {
    const context = audio.getContext();

    if (!context) return;

    if (state === "off") {
      context.suspend();
    } else {
      context.resume();
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
}

export const soundSelector: SoundSelector = new SoundSelector();
