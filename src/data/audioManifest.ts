/**
 * Manifest of the complete original sound set, copied verbatim from
 * imp1_fixed/audio/v1.0 into public/audio.
 *
 * common/audioManager.ts fetches and decodes every name listed here at
 * startup and nothing else, so this is not just an inventory: dropping
 * a file into public/audio does nothing until its name appears in this
 * array.
 */
export const originalAudioNames = [
  // Speech samples
  "another.visitor",
  "destroy.him",
  "die.by.zap",
  "hahaha",
  "mission.accomplished",
  "nonono",
  // Agent movement
  "jump.left",
  "jump.right",
  "step.left",
  "step.right",
  "falling",
  // Elevator and robots
  "elevator.start",
  "elevator.stop",
  "droid",
  "droid.turn",
  "zap1",
  "zap2",
  "zap3",
  "zap4",
  "zap5",
  // Terminals and pocket computer
  "beep1",
  "beep2",
  "beep3",
  "beep4",
  "beep5",
  "dial1",
  "dial2",
  "in.line",
  // Music room organ
  "organ.tone1",
  "organ.tone2",
  "organ.tone3",
  "organ.tone4",
  "organ.tone5",
  "organ.tone6",
  "organ.tone7",
  "organ.tone8",
  "organ.tone9",
  "organ.tone10",
  "organ.tone11",
  "organ.tone12",
  "organ.tone13",
  "organ.tone14",
] as const;

export type OriginalAudioName = (typeof originalAudioNames)[number];

/**
 * Per-sound level corrections, applied on top of the master gain in
 * common/audioManager.ts. Linear multipliers, not decibels.
 *
 * The rips preserve the original's levels verbatim, and a handful of
 * sounds sit far enough below the rest to vanish the moment anything
 * else is playing. Measuring RMS across the effects (speech excluded,
 * since it is deliberately the loudest group) gives a median of about
 * -29.7 dBFS; only these three fall more than 10 dB below that.
 *
 * Everything else is left alone on purpose. Footsteps sitting well
 * under speech is the original's mix rather than a defect, and the
 * point of this table is to fix what is inaudible, not to flatten the
 * dynamics into a modern loudness war.
 *
 * The values bring each sound up to that -10 dB line, capped so none
 * peaks above 0.7 after the master gain — sounds overlap, and the
 * destination clamps hard at 1.0.
 */
export const audioTrim: Partial<Record<OriginalAudioName, number>> = {
  "droid.turn": 1.2,
  "step.left": 1.4,
  "step.right": 1.6,
};

export function originalAudioPath(name: OriginalAudioName): string {
  return `/audio/${name}.ogg`;
}
