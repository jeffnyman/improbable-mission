// Checks whether any card can be "solved" with pieces from other
// cards. The game's merge rule accepts a piece when its opaque pixels
// overlap the stack's in exactly the 172 frame pixels, i.e. when the
// interiors do not collide, and isSolved() only counts three merged
// pieces on an unflipped base. So a card is solvable with foreign
// pieces if three pieces from other cards have interiors that miss
// each other and the base. This tests every such triple.
import { openGame } from "./harness.mjs";
const { browser, page } = await openGame({ url: "http://localhost:5399/improbable-mission/", map: 0, seed: 4, cheats: ["stayforever", "timelord"] });
const out = await page.evaluate(async () => {
  const { Puzzle } = await import("/improbable-mission/src/component/puzzle.ts");
  const h = window.__h;
  const W = 48, HGT = 21, WORDS = Math.ceil((W * HGT) / 32);
  async function mask(n, v, hz) {
    const p = new Puzzle(n);
    p.setRandomProperties(5);
    p.setFlipV(v); p.setFlipH(hz); p.generateImage();
    for (let i = 0; i < 400 && !(p.imageData && p.imageData.complete); i++) await h.yield();
    const c = document.createElement("canvas"); c.width = W; c.height = HGT;
    const ctx = c.getContext("2d"); ctx.drawImage(p.imageData, 0, 0);
    const d = ctx.getImageData(0, 0, W, HGT).data;
    const m = new Uint32Array(WORDS);
    for (let i = 0; i < W * HGT; i++) if (d[i * 4 + 3] === 255) m[i >> 5] |= 1 << (i & 31);
    return m;
  }
  const pop = (m) => m.reduce((s, w) => { w -= (w >>> 1) & 0x55555555; w = (w & 0x33333333) + ((w >>> 2) & 0x33333333); return s + ((((w + (w >>> 4)) & 0xf0f0f0f) * 0x1010101) >>> 24); }, 0);
  const and = (a, b) => a.map((w, i) => w & b[i]);
  const or = (a, b) => a.map((w, i) => w | b[i]);
  const orient = [[false, false], [true, false], [false, true], [true, true]];
  const masks = [];
  for (let n = 0; n < 36; n++) for (const [v, hz] of orient) masks.push({ n, set: Math.floor(n / 4), o: `${v ? "v" : ""}${hz ? "h" : ""}`, m: await mask(n, v, hz) });
  const fits = (stack, m) => pop(and(stack, m)) === 172;
  const lines = [];
  for (let set = 0; set < 9; set++) {
    const hits = [];
    for (let b = set * 4; b < set * 4 + 4; b++) {
      const base = masks.find((x) => x.n === b && x.o === "").m;
      const cand = masks.filter((x) => x.n !== b && fits(base, x.m));
      for (let i = 0; i < cand.length; i++) {
        const s1 = or(base, cand[i].m);
        for (let j = i + 1; j < cand.length; j++) {
          if (cand[j].n === cand[i].n || !fits(s1, cand[j].m)) continue;
          const s2 = or(s1, cand[j].m);
          for (let k = j + 1; k < cand.length; k++) {
            if (cand[k].n === cand[i].n || cand[k].n === cand[j].n || !fits(s2, cand[k].m)) continue;
            const trio = [cand[i], cand[j], cand[k]];
            const foreign = trio.filter((x) => x.set !== set).length;
            if (foreign) hits.push(`base ${b} + ${trio.map((x) => `${x.n}${x.o}${x.set !== set ? "*" : ""}`).join(" ")}`);
          }
        }
      }
    }
    lines.push(`card ${set + 1}: ${hits.length ? hits.length + " stacks with foreign pieces (*) count as solved, e.g. " + hits.slice(0, 2).join("; ") : "only its own four pieces can complete it"}`);
  }
  return lines;
});
console.log(out.join("\n"));
await browser.close();
