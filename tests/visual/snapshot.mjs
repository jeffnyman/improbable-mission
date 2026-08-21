/**
 * Canvas snapshot harness.
 *
 * The unit suite covers data tables and pure functions; nothing in it
 * executes a single graphics.draw() call. This fills that gap for
 * changes that are meant to be purely mechanical — extracting sprite
 * regions into named constants, reshuffling draw code — where the
 * correct assertion is "the rendered pixels did not move."
 *
 *   node tests/visual/snapshot.mjs capture   # write baselines
 *   node tests/visual/snapshot.mjs compare   # diff against baselines
 *
 * Comparison is a pixel count, not byte equality. A handful of pixels
 * differing is the cost of a game that animates; a misapplied sprite
 * region shows up as thousands. FAIL_THRESHOLD sits between those, and
 * a diff image is written for anything non-zero so the difference can
 * be looked at rather than guessed about.
 *
 * Decoding and diffing happen inside the browser through canvas, which
 * is why this needs no PNG library.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { scenes } from "./scenes.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const BASELINE_DIR = resolve(here, "baseline");
const CURRENT_DIR = resolve(here, "current");
const DIFF_DIR = resolve(here, "diff");

const PORT = 4180;
const BASE_URL = `http://localhost:${PORT}/improbable-mission/`;
const VIEWPORT = { width: 1280, height: 800 };

// Per-channel slack, absorbing any nondeterminism in how the browser
// composites identical pixels rather than any real difference.
const CHANNEL_TOLERANCE = 8;

// Fallback for a scene that does not declare its own maxDrift. Every
// scene should declare one, measured rather than guessed.
const DEFAULT_MAX_DRIFT = 250;

const RNG_SEED = 0x9e3779b9;

/**
 * Replaces Math.random with mulberry32 before any page script runs.
 * Every random draw in the game goes through rnd() in utils/common.ts,
 * which sits on Math.random, so seeding here is enough to pin the map
 * furniture, the puzzle pieces and the robot types.
 */
function seedRandom(seed) {
  return `(() => {
    let s = ${seed};
    Math.random = () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })()`;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function startServer() {
  const projectRoot = resolve(here, "../..");

  // Spawn Vite's JS entry through this same Node binary rather than
  // going via npx. On Windows, spawning a .cmd shim without a shell
  // fails outright with EINVAL, and turning the shell on to work
  // around that brings quoting problems of its own.
  return spawn(
    process.execPath,
    [
      resolve(projectRoot, "node_modules/vite/bin/vite.js"),
      "preview",
      "--port",
      String(PORT),
    ],
    { cwd: projectRoot, stdio: "ignore" },
  );
}

async function waitForServer(page, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      await page.goto(BASE_URL, { timeout: 1000 });
      return true;
    } catch {
      await page.waitForTimeout(250);
    }
  }
  return false;
}

/** Drives one scene and returns the game canvas as a PNG buffer. */
async function captureScene(browser, scene) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    // The opening crawl skips itself under reduced motion, which gets
    // it out of the way without racing a keypress against it.
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  await page.addInitScript(seedRandom(RNG_SEED));
  await page.goto(`${BASE_URL}${scene.query}`);

  await page.waitForSelector("#accept");
  await page.click("#accept");

  await page.waitForSelector("#game", { state: "attached" });
  await page.waitForTimeout(scene.settleMs);

  for (const step of scene.keys ?? []) {
    if (step.hold) {
      await page.keyboard.down(step.hold);
      await page.waitForTimeout(step.forMs);
      await page.keyboard.up(step.hold);
    } else {
      await page.keyboard.press(step.press);
    }

    await page.waitForTimeout(step.afterMs ?? 0);
  }

  // Pause before capturing: the engine stops drawing while paused, so
  // the canvas holds still instead of advancing under the read.
  await page.keyboard.press("KeyP");
  await page.waitForTimeout(250);

  // Read the canvas backing store rather than screenshotting the
  // element. The canvas is 960x600 internally but CSS-sized to fit the
  // window, so an element screenshot would hand back a resampled image
  // and every comparison would be fighting interpolation noise.
  const dataUrl = await page.evaluate(() => {
    const canvas = document.getElementById("game");
    return canvas.toDataURL("image/png");
  });

  await context.close();
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

/**
 * Diffs two PNGs in the page: both are decoded onto canvases, and any
 * pixel whose channels differ by more than the tolerance is counted
 * and painted into a diff image.
 */
async function diffPngs(page, baselineB64, currentB64) {
  return page.evaluate(
    async ([a, b, tolerance]) => {
      const load = (b64) =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = `data:image/png;base64,${b64}`;
        });

      const [imgA, imgB] = await Promise.all([load(a), load(b)]);

      if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
        return {
          differing: Infinity,
          total: 0,
          note: `size changed: ${imgA.width}x${imgA.height} vs ${imgB.width}x${imgB.height}`,
          diff: null,
        };
      }

      const { width, height } = imgA;
      const bounds = { x0: width, y0: height, x1: -1, y1: -1 };
      const read = (img) => {
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, width, height).data;
      };

      const pa = read(imgA);
      const pb = read(imgB);

      const out = document.createElement("canvas");
      out.width = width;
      out.height = height;
      const outCtx = out.getContext("2d");
      const diff = outCtx.createImageData(width, height);

      let differing = 0;

      for (let i = 0; i < pa.length; i += 4) {
        const changed =
          Math.abs(pa[i] - pb[i]) > tolerance ||
          Math.abs(pa[i + 1] - pb[i + 1]) > tolerance ||
          Math.abs(pa[i + 2] - pb[i + 2]) > tolerance ||
          Math.abs(pa[i + 3] - pb[i + 3]) > tolerance;

        if (changed) {
          differing++;

          const px = (i / 4) % width;
          const py = Math.floor(i / 4 / width);
          if (px < bounds.x0) bounds.x0 = px;
          if (py < bounds.y0) bounds.y0 = py;
          if (px > bounds.x1) bounds.x1 = px;
          if (py > bounds.y1) bounds.y1 = py;

          // Magenta on the changes, the unchanged image dimmed behind.
          diff.data[i] = 255;
          diff.data[i + 1] = 0;
          diff.data[i + 2] = 255;
          diff.data[i + 3] = 255;
        } else {
          diff.data[i] = pa[i] * 0.25;
          diff.data[i + 1] = pa[i + 1] * 0.25;
          diff.data[i + 2] = pa[i + 2] * 0.25;
          diff.data[i + 3] = 255;
        }
      }

      outCtx.putImageData(diff, 0, 0);

      return {
        differing,
        total: width * height,
        note: null,
        // Where the changes are, which is what separates "robots
        // walked on" from "a wall moved".
        bounds: bounds.x1 < 0 ? null : bounds,
        diff: out.toDataURL("image/png").split(",")[1],
      };
    },
    [baselineB64, currentB64, CHANNEL_TOLERANCE],
  );
}

async function main() {
  const mode = process.argv[2];

  if (mode !== "capture" && mode !== "compare") {
    console.error("usage: node tests/visual/snapshot.mjs capture|compare");
    process.exit(2);
  }

  const outDir = mode === "capture" ? BASELINE_DIR : CURRENT_DIR;
  await mkdir(outDir, { recursive: true });
  if (mode === "compare") await mkdir(DIFF_DIR, { recursive: true });

  const server = startServer();
  const browser = await chromium.launch();

  let failed = false;

  try {
    const probe = await browser.newPage();

    if (!(await waitForServer(probe))) {
      throw new Error(
        `preview server never came up on ${PORT} — run "npm run build" first`,
      );
    }

    await probe.close();

    for (const scene of scenes) {
      const shot = await captureScene(browser, scene);
      const target = resolve(outDir, `${scene.name}.png`);
      await writeFile(target, shot);

      if (mode === "capture") {
        console.log(`captured ${scene.name}`);
        continue;
      }

      const baselinePath = resolve(BASELINE_DIR, `${scene.name}.png`);

      if (!(await exists(baselinePath))) {
        console.log(`${scene.name}: no baseline — run capture first`);
        failed = true;
        continue;
      }

      const baseline = await readFile(baselinePath);
      const page = await browser.newPage();
      const result = await diffPngs(
        page,
        baseline.toString("base64"),
        shot.toString("base64"),
      );
      await page.close();

      if (result.diff) {
        await writeFile(
          resolve(DIFF_DIR, `${scene.name}.png`),
          Buffer.from(result.diff, "base64"),
        );
      }

      const pct =
        result.total > 0
          ? ((result.differing / result.total) * 100).toFixed(3)
          : "n/a";
      const maxDrift = scene.maxDrift ?? DEFAULT_MAX_DRIFT;
      const over = result.differing > maxDrift;

      if (over) failed = true;

      const where = result.bounds
        ? ` at ${result.bounds.x0},${result.bounds.y0}-${result.bounds.x1},${result.bounds.y1}`
        : "";

      console.log(
        `${(over ? "FAIL" : "ok").padEnd(4)} ${scene.name}: ` +
          `${result.differing} px differ (${pct}%, allowed ${maxDrift})${where}` +
          (result.note ? ` — ${result.note}` : ""),
      );
    }
  } finally {
    await browser.close();
    server.kill();
  }

  process.exit(failed ? 1 : 0);
}

await main();
