import { audio } from "./audioManager";

/**
 * Cheat codes, activated by typing the code word on the keyboard
 * during play (letter keys are unused by the game itself), or via
 * a ?cheats=name,name query parameter for testing. Typing a code
 * again toggles it off.
 *
 * - STAYFOREVER: invincibility — robots and the orb can't zap the
 *   agent. ("Another visitor. Stay a while. Stay forever!")
 * - AIRWALK: the agent never falls — gaps can be walked across.
 * - TIMELORD: the mission clock freezes entirely — no ticking, no
 *   phone charges, no death penalties.
 * - XRAY: the pocket computer displays the entire map, every
 *   shaft, corridor, and room, regardless of exploration.
 *
 * Using any cheat marks the game, and a marked game's score stays
 * off the persisted hall of fame.
 */
class Cheats {
  private flags: Record<string, boolean> = {
    STAYFOREVER: false,
    AIRWALK: false,
    TIMELORD: false,
    XRAY: false,
  };

  // Whether any cheat was ever enabled this game.
  private used = false;

  // Rolling buffer of recently typed letters.
  private typed = "";

  // The toggle banner ("STAYFOREVER ON") and when it expires.
  private banner = "";
  private bannerUntil = 0;

  constructor() {
    // Query-parameter activation (read before mission.ts strips
    // the query string).
    const requested = new URLSearchParams(window.location.search).get("cheats");

    if (requested) {
      for (const name of requested.split(",")) {
        const code = name.trim().toUpperCase();
        if (code in this.flags) this.toggle(code, true);
      }
    }

    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  isInvincible() {
    return this.flags.STAYFOREVER;
  }

  canWalkOnAir() {
    return this.flags.AIRWALK;
  }

  isTimeFrozen() {
    return this.flags.TIMELORD;
  }

  isXray() {
    return this.flags.XRAY;
  }

  wasUsed() {
    return this.used;
  }

  /**
   * The active toggle banner, or an empty string once it expires.
   */
  getBanner() {
    return Date.now() < this.bannerUntil ? this.banner : "";
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!/^Key[A-Z]$/.test(e.code)) return;

    const longest = Math.max(...Object.keys(this.flags).map((c) => c.length));
    this.typed = (this.typed + e.code.slice(3)).slice(-longest);

    for (const code of Object.keys(this.flags)) {
      if (this.typed.endsWith(code)) {
        this.toggle(code);
        this.typed = "";
      }
    }
  }

  private toggle(code: string, silent = false) {
    this.flags[code] = !this.flags[code];
    if (this.flags[code]) this.used = true;

    this.banner = `${code} ${this.flags[code] ? "ON" : "OFF"}`;
    this.bannerUntil = Date.now() + 2500;

    // Direct play rather than the request queue: a keystroke can
    // land between frames, where a queued request would be
    // cleared before it plays.
    if (!silent) audio.play(this.flags[code] ? "beep5" : "beep1");
  }
}

export const cheats: Cheats = new Cheats();
