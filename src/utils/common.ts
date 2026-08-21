/**
 * A roll of 1 to limit, inclusive — not the 0-based range a JS reader
 * expects. It mirrors Commodore BASIC's INT(RND(1)*n)+1, which is what
 * the original used throughout, so the ported tables and probabilities
 * only line up on a 1-based roll.
 *
 * This is why indexing with it needs the offset put back:
 *
 *   [5, 7, 3][rnd(3) - 1]
 */
export function rnd(limit: number) {
  return Math.floor(Math.random() * limit) + 1;
}
