# Canvas snapshots

The unit suite in `tests/` covers data tables and pure functions. None
of it executes a single `graphics.draw()` call, so nothing there would
notice if a sprite were drawn from the wrong part of the sprite sheet.

This harness fills that gap for changes meant to be purely mechanical —
extracting sprite regions into named constants, moving draw code
around — where the correct assertion is "the rendered pixels did not
move."

## Running it

The comparison serves the built app, so build first.

```
npm run build
npm run test:visual          # compare against the committed baselines
npm run test:visual:update    # rewrite the baselines
```

Both spawn their own Vite preview server on port 4180 and shut it down
afterwards. Output lands in:

- `baseline/` — committed, the reference images
- `current/` — the latest capture (gitignored)
- `diff/` — changed pixels in magenta over a dimmed original (gitignored)

Update the baselines only when a rendering change was intended, and look
at the diff images before you do.

## How it stays deterministic

Three things pin the game down, and the run is byte-identical without
them only by luck:

- `?map=0` forces one of the 11 layouts instead of rolling for one.
- `?cheats=timelord` freezes the mission clock, which otherwise ticks a
  digit about once a second and changes every capture. `airwalk` and
  `stayforever` keep the scripted walk from dying to a gap or a robot.
- `Math.random` is replaced with a seeded generator before any page
  script runs. Every random draw in the game goes through `rnd()` in
  `src/utils/common.ts`, which sits on `Math.random`, so seeding there
  is enough to pin the furniture contents, puzzle pieces and robot
  types.

The game is then paused before the canvas is read, because the engine
stops drawing while paused and the image holds still. The canvas
backing store is read with `toDataURL` rather than screenshotting the
element: the canvas is 960x600 internally but CSS-scaled to the window,
so an element screenshot would return a resampled image and every
comparison would be fighting interpolation noise.

## What it does and does not catch

Three of the four scenes settle to a genuinely still image and compare
at 0 differing pixels run to run.

`room-entry` does not. Robots patrol and the orb drifts, and pausing
lands on whichever frame the scripted input reached, so they sit a step
or two apart between runs — a measured 450 to 1710 pixels. Its budget is
set above that, which makes it a coarse guard: it will catch a wall,
floor or furniture sprite drawn from the wrong region, but a single 8x8
tile astray is only about 576 canvas pixels and could hide inside the
drift.

The reported bounding box is the thing to read before trusting a pass.
Drift sits on the robots, roughly `336,57-848,572`; a change reaching
outside that is something else. Verified by deliberately breaking the
room's left wall sprite: the box started at `0,0` and the count went to
6840.

## Scene coverage

Covered: the intro scene, an idle elevator, an elevator that has
descended a level, and one room with platforms, three robots, the orb
and four furniture types.

Not covered: the security terminal screen, the organ room, the pocket
computer puzzle desktop, and the phone. Each needs an input script to
reach, and the pocket computer in particular did not switch state from a
plain fire press during setup, so it needs its trigger worked out rather
than guessed. Adding a scene is a new entry in `scenes.mjs`.
