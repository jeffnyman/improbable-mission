// Opens Improbable Mission in headless Chromium under the in-page
// harness (page.js) and takes control of the game loop.
//
// The game must be served by the Vite dev server, because the harness
// imports the live game modules from it.

import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const pageScript = fileURLToPath(new URL("./page.js", import.meta.url));
const brainScript = fileURLToPath(new URL("./brain.js", import.meta.url));

export async function openGame({ url, map, seed, cheats, viewport }) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: viewport ?? { width: 1280, height: 860 },
    // Reduced motion makes the game skip the opening crawl.
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (err) => console.error("page error:", err.message));
  await page.addInitScript((s) => (window.__SEED = s), seed);
  await page.addInitScript({ path: pageScript });
  await page.addInitScript({ path: brainScript });

  const target = new URL(url);
  target.searchParams.set("map", String(map));
  if (cheats?.length) target.searchParams.set("cheats", cheats.join(","));
  await page.goto(target.href);

  // Accept the mission, which starts the engine, then wait until the
  // engine has handed its scan loop to the harness.
  await page.click("#accept");
  await page.waitForFunction(() => window.__h.scanFn, null, { timeout: 30_000 });
  await page.evaluate(async () => {
    await window.__h.load();
    window.__h.takeControl();
  });
  return { browser, page };
}
