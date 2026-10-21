// Surveys every room from every door: which furniture the planner
// can reach and which doors it can leave by, starting with the lifts
// in their initial positions. Usage: node tools/agent/survey.mjs [url]
import { writeFileSync } from "node:fs";
import { openGame } from "./harness.mjs";

const url = process.argv[2] ?? "http://localhost:5399/improbable-mission/";
const { browser, page } = await openGame({ url, map: 0, seed: 1, cheats: ["stayforever", "timelord"] });
const results = [];
await page.evaluate(() => window.__h.until(() => window.__h.scene() === "elevator", 600));
for (let r = 1; r <= 32; r++) {
  for (const side of ["left", "right"]) {
    const res = await page.evaluate(([r, side]) => window.__h.brain.survey(r, side), [r, side]);
    if (!res) continue;
    results.push(res);
    console.log(`room ${String(r).padStart(2)} from ${side.padEnd(5)}: ${res.reachable}/${res.total} furniture, exits [${res.exits}]${res.unreachable.length ? "  UNREACHABLE " + res.unreachable.join(" ") : ""}  (${res.explored} moves tried)`);
  }
}
writeFileSync("tools/agent/survey.json", JSON.stringify(results, null, 1));
await browser.close();
