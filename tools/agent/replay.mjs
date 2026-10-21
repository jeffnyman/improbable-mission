// Replays a recording into a fresh game and reports where it ends.
// Usage: node tools/agent/replay.mjs [recording.json] [page url]
import { readFileSync } from "node:fs";
import { openGame } from "./harness.mjs";

const file = process.argv[2] ?? "tools/agent/map0-seed4.json";
const url = process.argv[3] ?? "http://localhost:5399/improbable-mission/";
const run = JSON.parse(readFileSync(file, "utf8"));
const { browser, page } = await openGame({ url, map: run.map, seed: run.seed, cheats: run.cheats });
const res = await page.evaluate((frames) => window.__h.replay(frames, false), run.frames);
await browser.close();
const won = "elvin" in res.marks;
console.log(`${won ? "WON" : "did not win"}: reached Elvin's door at frame ${res.marks.elvin ?? "-"}, ended in ${res.scene}, password "${res.status.password}", ${res.status.pieces} pieces found`);
console.log("first frame in each scene:", JSON.stringify(res.marks));
process.exitCode = won ? 0 : 1;
