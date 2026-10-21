# Logic-completion agent

An agent that plays Improbable Mission from the first elevator to Elvin's door with two cheats on: invincibility (`stayforever`) and a frozen clock (`timelord`). It collects all 36 puzzle pieces, assembles the nine punch cards through the pocket computer's real controls, and opens the door. A win proves the chain from search to password to door works on a layout. It does not prove the game can be won against robots and the clock.

Airwalk is deliberately left off. It stops all falling, and the rooms rely on dropping from ledges to lower platforms, so airwalk makes parts of some rooms unreachable that are reachable in normal play.

## How it works

The harness (`page.js`) is injected into the page before any game script and changes nothing in the game's code:

| Problem | What the harness does |
| --- | --- |
| Random rolls | Replaces `Math.random` with a seeded generator whose state can be saved and restored |
| Game logic runs on a 27ms timer | Captures the timer and advances the game one scan frame at a time |
| Room transitions advance in the drawing loop | Captures that loop too, and calls the game's animation update during transitions |
| Drawing rolls dice (robot zap flicker) | Restores the random state after every animation update |
| The intro, phone and terminal use real-time timers | Runs `setTimeout` on a virtual clock that moves 27ms per frame |
| Piece images load asynchronously | Waits for every piece image to load while the pocket computer is open |

The brain (`brain.js`) plans with the real engine as its model. To move inside a room it snapshots the room, tries a move (a walk, a running or standing jump, or a lift ride) by stepping the game, and restores the snapshot, searching breadth first until it reaches the goal. Between rooms it routes through elevator shafts and corridors with a shortest-path search.

## Files

| File | Purpose |
| --- | --- |
| `page.js` | In-page harness: seeded dice, captured loops, virtual timers, input, snapshots, replay |
| `brain.js` | Routing, room planning, searching, the puzzle desktop, the door, and the room survey |
| `harness.mjs` | Opens the game in headless Chromium and takes control |
| `agent.mjs` | Plays a layout and seed to the end and writes the recording |
| `replay.mjs` | Replays a recording in a fresh game and reports where it ends |
| `record.mjs` | Films a recording at true speed |
| `survey.mjs` | Checks every room from every door for furniture the planner cannot reach |
| `seeds.mjs` | Lists, per layout, which seeds keep puzzle pieces out of room 24 |
| `wrongcard.mjs` | Checks every stack of pieces the game would accept, to see if any card can be finished with another card's pieces |
| `map0-seed4.json` to `map10-seed4.json` | Winning recordings for all 11 layouts, seed 4 |
| `map0-seed4.webm` | A video of the map 0 run at true speed, 12.5 minutes and 118 MB |

## Commands

Start the dev server on a known port first. The harness imports the live game modules from it.

```sh
npx vite --port 5399 --strictPort
```

Then:

```sh
node tools/agent/agent.mjs  0 4                       # play map 0 with seed 4
node tools/agent/replay.mjs tools/agent/map0-seed4.json
node tools/agent/record.mjs tools/agent/map0-seed4.json tools/agent/map0-seed4.webm
node tools/agent/survey.mjs                           # room reachability report
node tools/agent/seeds.mjs  0 10 12                   # clean seeds per layout
node tools/agent/wrongcard.mjs                        # foreign-piece check
```

Filming needs an ffmpeg that can encode VP8, set with `FFMPEG` if it is not on the path. Playwright's own ffmpeg build works.

## What it found

- **All 11 layouts can be won.** With seed 4 the agent won every layout, each spelling that layout's password, in 26,000 to 31,500 scan frames, or 12 to 14 minutes of game time.

- **Room 24's top floor is unreachable in this port.** The fireplace and the chair with the lamp stand on a floor reachable only from the second floor, and every jump from a lift onto the second floor's ledges misses. From the left lift, starting a jump clamps the agent 4 pixels to the right and the landing overshoots the ledge by about that much. From the right lift, the jump overshoots one ledge and falls short of the next. Nine of the first twelve seeds put a piece up there, on every layout, which makes those games unwinnable. Placement picks a room first and furniture second, so a room with only two items gets a piece far more often than its share of furniture. Check the room in the original before treating this as a port bug.
- **No card can be finished with another card's pieces, for now.** The solved check never verifies which card a piece belongs to, but with today's fixed piece shapes no stack containing a foreign piece fits. That changes if pieces are ever cut fresh each game.
- **Room 17's bookcase is reachable only from the left door.** That is fine for play, since the left door is available, but it is worth knowing.

## Recording format

A recording holds the layout, seed and cheats, plus one input value per scan frame. Its bits are up 1, down 2, left 4, right 8 and fire 16. The seed and layout must travel with the frames: the same frames on a different seed play a different game.
