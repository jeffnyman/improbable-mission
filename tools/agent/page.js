// In-page harness for driving Improbable Mission deterministically.
// Injected before any game script by harness.mjs.
//
// It makes four changes to the page, none of them to the game's code:
//
// 1. Math.random becomes a seeded generator whose state can be saved
//    and restored. Every random roll in the game goes through it.
// 2. The engine's 27ms scan timer is captured instead of scheduled,
//    so the harness advances game logic one scan frame at a time.
// 3. The engine's drawing loop is captured too. The harness calls
//    the game's animation update itself: during room transitions
//    (which the game advances in that loop) and when a picture is
//    wanted. The random state is restored around each call, because
//    drawing also rolls dice.
// 4. Once the harness takes control, setTimeout runs on a virtual
//    clock that advances 27ms per scan frame.

(() => {
  const H = (window.__h = {});

  // ---- 1. Seeded random numbers (mulberry32) -----------------------
  let rng = (window.__SEED ?? 1) >>> 0;
  Math.random = function () {
    rng = (rng + 0x6d2b79f5) >>> 0;
    let t = rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  H.getRng = () => rng;
  H.setRng = (s) => (rng = s);

  // ---- 2 and 3. Captured loops ------------------------------------
  const realSetInterval = window.setInterval.bind(window);
  const realRaf = window.requestAnimationFrame.bind(window);
  window.setInterval = (fn, ms, ...args) => {
    if (ms === 27) {
      H.scanFn = fn;
      return 27027;
    }
    return realSetInterval(fn, ms, ...args);
  };
  window.requestAnimationFrame = (cb) => {
    if (H.inControl || H.scanFn) return 0; // the engine's loop stops here
    return realRaf(cb);
  };

  // ---- 4. Virtual timers ------------------------------------------
  const realSetTimeout = window.setTimeout.bind(window);
  const realClearTimeout = window.clearTimeout.bind(window);
  let vnow = 0;
  let timers = [];
  let nextTimer = 1_000_000;
  window.setTimeout = (fn, ms = 0, ...args) => {
    if (!H.inControl) return realSetTimeout(fn, ms, ...args);
    const id = nextTimer++;
    timers.push({ id, due: vnow + (ms || 0), fn: () => fn(...args) });
    return id;
  };
  window.clearTimeout = (id) => {
    const i = timers.findIndex((t) => t.id === id);
    if (i >= 0) timers.splice(i, 1);
    else realClearTimeout(id);
  };

  // ---- Game modules -----------------------------------------------
  const base = "/improbable-mission/src/";
  H.load = async () => {
    const [g, a, e, k, p, s, l, c, t] = await Promise.all([
      import(base + "game.ts"),
      import(base + "component/agent.ts"),
      import(base + "component/elevator.ts"),
      import(base + "common/keyboardManager.ts"),
      import(base + "component/pocketComputer.ts"),
      import(base + "common/sceneManager.ts"),
      import(base + "data/layout.ts"),
      import(base + "common/cheats.ts"),
      import(base + "common/gameTime.ts"),
    ]);
    Object.assign(H, {
      game: g.game,
      agent: a.agent,
      elevator: e.elevator,
      keyboard: k.keyboard,
      pc: p.pocketComputer,
      scenes: s.sceneManager,
      layout: l,
      cheats: c.cheats,
      gameTime: t.gameTime,
    });
  };

  H.takeControl = () => {
    H.inControl = true;
    H.frames = [];
  };

  // ---- Input ------------------------------------------------------
  // Bits: up 1, down 2, left 4, right 8, fire 16. A key the game has
  // latched to "hold" stays latched while it is still held, exactly as
  // with a real keyboard, and is cleared only by releasing it.
  const KEYS = [
    [1, "ArrowUp"],
    [2, "ArrowDown"],
    [4, "ArrowLeft"],
    [8, "ArrowRight"],
    [16, "ShiftLeft"],
  ];
  function applyKeys(bits) {
    const pressed = H.keyboard.pressedKeys;
    for (const [bit, code] of KEYS) {
      if (bits & bit) {
        if (pressed[code] !== "hold") pressed[code] = true;
      } else {
        pressed[code] = false;
      }
    }
  }

  // ---- Stepping ---------------------------------------------------
  H.draw = false;
  H.step = (bits) => {
    applyKeys(bits);
    vnow += 27;
    timers.sort((x, y) => x.due - y.due || x.id - y.id);
    while (timers.length && timers[0].due <= vnow) timers.shift().fn();
    H.scanFn();
    if (H.game.transitionState || H.draw) {
      const saved = rng;
      H.game.updateAnimation();
      rng = saved;
    }
    H.frames.push(bits);
  };
  H.run = (bits, n) => {
    for (let i = 0; i < n; i++) H.step(bits);
  };
  // Step with no input until a condition holds, or give up.
  H.until = (cond, max = 2000, bits = 0) => {
    for (let i = 0; i < max; i++) {
      if (cond()) return true;
      H.step(bits);
    }
    return cond();
  };
  H.yield = () => new Promise((r) => realSetTimeout(r, 0));

  // ---- Replay -----------------------------------------------------
  // Plays recorded frames back. Piece images on the pocket computer
  // load asynchronously and the game compares their pixels when
  // stacking, so while the pocket computer is open each frame waits
  // for every piece image to finish loading, as the agent did.
  async function piecesLoaded() {
    for (let i = 0; i < 400; i++) {
      const pieces = [H.pc.grabbedPuzzle, ...H.pc.desktop].filter(Boolean).flatMap((p) => [p, ...p.getOverlapPuzzles()]);
      if (pieces.every((p) => p.imageData && p.imageData.complete)) return;
      await H.yield();
    }
  }
  H.replay = async (frames, realtime) => {
    H.draw = true;
    const marks = {};
    const start = performance.now();
    for (let i = 0; i < frames.length; i++) {
      if (H.pc.getState() !== "map") await piecesLoaded();
      H.step(frames[i]);
      const scene = H.scene();
      if (!(scene in marks)) marks[scene] = i + 1;
      if (realtime) {
        const due = start + (i + 1) * 27;
        const wait = due - performance.now();
        if (wait > 0) await new Promise((r) => realSetTimeout(r, wait));
      } else if (i % 500 === 0) await H.yield();
    }
    return { marks, status: H.status(), scene: H.scene() };
  };

  // ---- State snapshots for planning --------------------------------
  // Copies an object's own fields: primitives by value, arrays of
  // primitives and plain objects of primitives by copy, and anything
  // else (references to other game objects) by reference.
  function snapObj(o) {
    const s = {};
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (v === null || typeof v !== "object") s[k] = v;
      else if (Array.isArray(v) && v.every((x) => x === null || typeof x !== "object")) s[k] = v.slice();
      else if (Object.getPrototypeOf(v) === Object.prototype && Object.values(v).every((x) => x === null || typeof x !== "object"))
        s[k] = { ...v };
      else s[k] = v;
    }
    return s;
  }
  function restoreObj(o, s) {
    for (const k of Object.keys(s)) {
      const v = s[k];
      o[k] = Array.isArray(v) ? v.slice() : v && Object.getPrototypeOf(v) === Object.prototype ? { ...v } : v;
    }
  }
  function roomObjects() {
    const room = H.game.room;
    if (!room) return [];
    return [
      room,
      ...room.getLiftGroups(),
      ...room.getRobots(),
      ...(room.getOrb() ? [room.getOrb()] : []),
      ...room.getFurnitureItems(),
      ...room.getTerminals(),
    ];
  }
  H.snapshot = () => {
    const objs = [H.game, H.agent, H.gameTime, H.elevator, H.pc, ...roomObjects()];
    return {
      objs,
      saved: objs.map(snapObj),
      keys: { ...H.keyboard.pressedKeys },
      rng,
      vnow,
      timers: timers.slice(),
      frames: H.frames.length,
    };
  };
  H.restore = (snap) => {
    snap.objs.forEach((o, i) => restoreObj(o, snap.saved[i]));
    H.keyboard.pressedKeys = { ...snap.keys };
    rng = snap.rng;
    vnow = snap.vnow;
    timers = snap.timers.slice();
    H.frames.length = snap.frames;
  };

  // ---- Reading the game -------------------------------------------
  H.scene = () => H.scenes.getScene();
  H.inTransition = () => !!H.game.transitionState;
  H.status = () => {
    const a = H.agent;
    const e = H.elevator.getCurrentPosition();
    return {
      frame: H.frames ? H.frames.length : 0,
      scene: H.scene(),
      room: H.game.roomId,
      x: a.x,
      y: a.y,
      action: a.action,
      shaft: e.x,
      ey: e.y,
      pieces: H.pc.getFoundedPieces(),
      solved: H.pc.getSolvedPuzzles(),
      password: H.game.getSolvedPassword(),
      time: H.game.getTime(),
    };
  };
})();
