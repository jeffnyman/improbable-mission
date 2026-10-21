// For each layout, finds the first seeds that put no puzzle piece in
// room 24, whose top floor the survey found unreachable.
// Usage: node tools/agent/seeds.mjs [first map] [last map] [seeds to try]
import { openGame } from "./harness.mjs";
const first = Number(process.argv[2] ?? 0), last = Number(process.argv[3] ?? 10), tries = Number(process.argv[4] ?? 12);
const { browser, page } = await openGame({ url: "http://localhost:5399/improbable-mission/", map: 0, seed: 1, cheats: ["stayforever", "timelord"] });
await browser.close();
for (let map = first; map <= last; map++) {
  const counts = [];
  for (let seed = 1; seed <= tries; seed++) {
    const { browser, page } = await openGame({ url: "http://localhost:5399/improbable-mission/", map, seed, cheats: ["stayforever", "timelord"] });
    counts.push(await page.evaluate(() => window.__h.game.getRoom(24).getFurnitureItems().filter((f) => f.getContents() === "puzzle").length));
    await browser.close();
  }
  const clean = counts.map((n, i) => (n ? null : i + 1)).filter(Boolean);
  console.log(`map ${String(map).padStart(2)}: pieces in room 24 by seed [${counts.join(" ")}]  clean seeds: ${clean.join(", ") || "none"}`);
}
