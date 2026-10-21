// Films a recording playing back in the real game at true speed, one
// scan frame every 27ms, streaming the page's screencast into ffmpeg.
// The video has no sound.
//
// Needs an ffmpeg that can encode VP8: set FFMPEG, or have one on the
// PATH. Playwright's own ffmpeg build works.
//
// Usage: node tools/agent/record.mjs [recording.json] [video.webm] [page url]

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { openGame } from "./harness.mjs";

const file = process.argv[2] ?? "tools/agent/map0-seed4.json";
const videoPath = process.argv[3] ?? file.replace(/\.json$/, ".webm");
const url = process.argv[4] ?? "http://localhost:5399/improbable-mission/";
const run = JSON.parse(readFileSync(file, "utf8"));
const FPS = 30;
const size = { width: 1280, height: 860 };

const ffmpeg = spawn(
  process.env.FFMPEG ?? "ffmpeg",
  [
    // These match the settings Playwright uses with its own ffmpeg build.
    "-loglevel", "error",
    "-f", "image2pipe", "-avioflags", "direct", "-fpsprobesize", "0",
    "-probesize", "32", "-analyzeduration", "0",
    "-c:v", "mjpeg", "-framerate", String(FPS), "-i", "pipe:0",
    "-y", "-an", "-c:v", "vp8", "-qmin", "0", "-qmax", "50", "-crf", "8",
    "-deadline", "realtime", "-speed", "8", "-b:v", "2M", "-threads", "1",
    videoPath,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);
const encoded = new Promise((resolve, reject) => {
  ffmpeg.on("error", reject);
  ffmpeg.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
});

const { browser, page } = await openGame({ url, map: run.map, seed: run.seed, cheats: run.cheats, viewport: size });

// The screencast only sends frames when the page changes, so a timer
// writes the latest one at a steady rate, catching up on the wall
// clock if the timer slips.
const cdp = await page.context().newCDPSession(page);
let latest = null;
cdp.on("Page.screencastFrame", ({ data, sessionId }) => {
  latest = Buffer.from(data, "base64");
  void cdp.send("Page.screencastFrameAck", { sessionId });
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: size.width, maxHeight: size.height });
let startedAt = 0;
let written = 0;
const writer = setInterval(() => {
  if (!latest) return;
  if (!startedAt) startedAt = performance.now();
  const due = Math.floor(((performance.now() - startedAt) / 1000) * FPS) + 1;
  for (; written < due; written++) ffmpeg.stdin.write(latest);
}, 1000 / FPS);

const res = await page.evaluate((frames) => window.__h.replay(frames, true), run.frames);
await page.waitForTimeout(2000);

clearInterval(writer);
await cdp.send("Page.stopScreencast");
await browser.close();
ffmpeg.stdin.end();
await encoded;

console.log(`saved ${videoPath}; reached Elvin's door at frame ${res.marks.elvin ?? "-"}, ended in ${res.scene}`);
