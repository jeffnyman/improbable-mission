// Logic-completion agent: plays Improbable Mission from the first
// elevator to Elvin's door with invincibility and a frozen clock on,
// and records every frame's input.
//
// Usage: node tools/agent/agent.mjs [map] [seed] [out.json] [page url]

import { writeFileSync } from "node:fs";
import { openGame } from "./harness.mjs";

const map = Number(process.argv[2] ?? 0);
const seed = Number(process.argv[3] ?? 4);
const out = process.argv[4] ?? `tools/agent/map${map}-seed${seed}.json`;
const url = process.argv[5] ?? "http://localhost:5399/improbable-mission/";
const cheats = ["stayforever", "timelord"];

const { browser, page } = await openGame({ url, map, seed, cheats });
page.on("console", (m) => {
  if (m.text().startsWith("frame")) console.log(m.text());
});

const started = Date.now();
const result = await page.evaluate(async () => {
  const h = window.__h;
  const b = h.brain;
  h.until(() => h.scene() === "elevator", 600);
  const stage = async (name, fn) => {
    const ok = await fn();
    b.helpers.say(`${name}: ${ok ? "done" : "FAILED"}`);
    return ok;
  };
  const ok =
    (await stage("collect all 36 pieces", b.collectAll)) &&
    (await stage("solve all nine cards", b.solveAll)) &&
    (await stage("open Elvin's door", b.openDoor));
  if (ok) {
    // Let the Elvin scene play into the score screen.
    h.draw = true;
    h.until(() => h.scene() === "scores", 4000);
    h.run(0, 200);
    h.draw = false;
  }
  return { ok, status: h.status(), scene: h.scene(), frames: h.frames, log: b.log };
});
await browser.close();

writeFileSync(out, JSON.stringify({ map, seed, cheats, won: result.ok, frames: result.frames, log: result.log }));
console.log(
  `${result.ok ? "WON" : "did not win"}: ${result.frames.length} frames, ended in scene ${result.scene}, ` +
    `password "${result.status.password}", ${((Date.now() - started) / 1000).toFixed(0)}s. Wrote ${out}`,
);
