import { audit } from "../utils/logger";
import { browser } from "../utils/browser";
import { options } from "../utils/options";

// Fallbacks for the properties the stylesheet owns, used only if the
// stylesheet did not load.
const FALLBACK_DURATION = 52;
const FALLBACK_PERSPECTIVE = 450;
const FALLBACK_TILT = 34;
const FALLBACK_EXIT = 0.22;

// Cutting a 256kbps track dead mid-sample clicks audibly, so the skip
// path ramps the volume down first.
const FADE_MS = 400;
const FADE_STEP_MS = 25;

// Keys that should not count as "any key": a bare modifier is usually
// the start of something else, and a held Ctrl or Meta means the
// player is talking to the browser, not to us.
const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta"]);

class MissionCrawl {
  private music: HTMLAudioElement | null = null;
  private scene: HTMLElement | null = null;
  private finished = false;
  private resolveRun: (() => void) | null = null;
  private safetyTimer: number | null = null;
  private fadeTimer: number | null = null;

  /**
   * Plays the opening crawl and resolves once it is over — either
   * because it ran its course or because the player skipped it.
   *
   * Resolves immediately, without showing anything, when the player
   * has asked for reduced motion; a minute of receding text is
   * exactly what that setting is about, and dropping straight into
   * the game is the behavior those players had before.
   */
  run(): Promise<void> {
    const scene = browser.requireElement("crawl");
    const text = browser.requireElement("crawlText");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      audit("Crawl skipped; reduced motion requested.");
      scene.remove();

      return Promise.resolve();
    }

    this.scene = scene;

    // Revealing the scene before measuring is what makes its height
    // readable at all. Both class changes land in this same task, so
    // nothing is painted in the un-animated state.
    scene.classList.add("active");

    const styles = getComputedStyle(scene);
    const duration = this.readNumber(
      styles,
      "--crawl-duration",
      FALLBACK_DURATION,
    );
    const travel = this.solveTravel(
      text.offsetHeight,
      scene.offsetHeight,
      this.readNumber(styles, "--crawl-perspective", FALLBACK_PERSPECTIVE),
      this.readNumber(styles, "--crawl-tilt", FALLBACK_TILT),
      this.readNumber(styles, "--crawl-exit", FALLBACK_EXIT),
    );

    scene.style.setProperty("--crawl-start", `${Math.round(travel.start)}px`);
    scene.style.setProperty("--crawl-end", `${Math.round(travel.end)}px`);

    const running = new Promise<void>((resolve) => {
      this.resolveRun = resolve;
    });

    text.addEventListener("animationend", this.onAnimationEnd, { once: true });
    document.addEventListener("keydown", this.onKeyDown);
    scene.addEventListener("pointerdown", this.onPointerDown);

    // If the animation never reports back — a browser that drops it,
    // a stylesheet that failed to load — the crawl must not become a
    // dead end in front of the game.
    this.safetyTimer = window.setTimeout(
      () => this.finish("safety net"),
      (duration + 3) * 1000,
    );

    this.startMusic();

    scene.classList.add("running");

    return running;
  }

  /**
   * Solves for the two ends of the slide.
   *
   * The plane is anchored to the bottom edge of the stage, so a point
   * `u` pixels along it from that anchor — negative being up and away
   * — lands at
   *
   *   screenY = py + (S + u·cos t - py) · P / (P - u·sin t)
   *
   * for a stage of height S, a perspective depth of P and its origin
   * py down the middle. The start needs no solving: sliding the text
   * down by its own height puts its first line at u = 0, which is the
   * bottom of the viewport at full size. The end is that equation
   * rearranged for the u which carries the last line up to the exit
   * line.
   */
  private solveTravel(
    textHeight: number,
    stageHeight: number,
    perspective: number,
    tiltDegrees: number,
    exitFraction: number,
  ): { start: number; end: number } {
    const tilt = (tiltDegrees * Math.PI) / 180;
    const py = stageHeight / 2;
    const exitY = stageHeight * exitFraction;

    const denominator =
      Math.cos(tilt) * perspective + (exitY - py) * Math.sin(tilt);

    // A steep tilt against a shallow perspective puts the vanishing
    // point below the exit line, and then no finite slide reaches it.
    // Two stage heights of travel is past the fade in that case.
    const end =
      denominator > 0
        ? ((exitY - stageHeight) * perspective) / denominator
        : -2 * stageHeight;

    return { start: textHeight, end };
  }

  private readNumber(
    styles: CSSStyleDeclaration,
    property: string,
    fallback: number,
  ): number {
    const value = Number.parseFloat(styles.getPropertyValue(property));

    return Number.isFinite(value) ? value : fallback;
  }

  private startMusic() {
    if (options.getSoundOption() === "off") return;

    const music = new Audio(`${import.meta.env.BASE_URL}audio/mission.crawl.mp3`);

    music.preload = "auto";

    // This track is a modern mix, mastered to full scale, whereas the
    // game's sound effects are 1984 rips averaging some 17 dB quieter.
    // Playing it at 0.7 made the game sound broken by comparison the
    // moment the crawl ended. Between this and the master gain in
    // common/audioManager.ts the two now sit within a few dB.
    music.volume = 0.4;

    // This runs out of the ACCEPT THE MISSION click with the gesture
    // still on the stack, which is what satisfies the autoplay
    // policy. A rejection is not worth stopping the crawl over.
    void music.play().catch((error) => {
      audit("Crawl music was not allowed to play", error);
    });

    this.music = music;
  }

  private stopMusic() {
    const music = this.music;

    if (!music) return;

    this.music = null;

    const steps = Math.max(1, Math.round(FADE_MS / FADE_STEP_MS));
    const decrement = music.volume / steps;

    this.fadeTimer = window.setInterval(() => {
      const next = music.volume - decrement;

      if (next <= 0.01) {
        if (this.fadeTimer !== null) window.clearInterval(this.fadeTimer);

        this.fadeTimer = null;
        music.pause();

        return;
      }

      music.volume = Math.max(0, next);
    }, FADE_STEP_MS);
  }

  private onAnimationEnd = () => {
    this.finish("crawl completed");
  };

  private onKeyDown = (evt: KeyboardEvent) => {
    if (MODIFIER_KEYS.has(evt.key)) return;
    if (evt.ctrlKey || evt.metaKey) return;

    this.finish(`skipped with ${evt.code}`);
  };

  private onPointerDown = () => {
    this.finish("skipped with pointer");
  };

  private finish(reason: string) {
    if (this.finished) return;

    this.finished = true;

    audit(`Crawl over: ${reason}.`);

    document.removeEventListener("keydown", this.onKeyDown);

    if (this.safetyTimer !== null) {
      window.clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }

    this.stopMusic();

    // The scene is torn out rather than hidden. It is a fixed,
    // full-viewport layer, so anything less would leave it sitting on
    // top of the game.
    this.scene?.remove();
    this.scene = null;

    this.resolveRun?.();
    this.resolveRun = null;
  }
}

export const missionCrawl: MissionCrawl = new MissionCrawl();
