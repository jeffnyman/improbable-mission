// The logic-completion agent, running inside the page next to the
// harness (page.js). With invincibility, airwalk and a frozen clock
// on, it visits every room holding a puzzle piece, searches the right
// furniture, assembles the nine punch cards on the pocket computer,
// and opens Elvin's door.
//
// Movement inside a room is planned with the real engine as the
// model: the planner snapshots the room, tries a move by stepping the
// game, and restores the snapshot, breadth first, until it finds a
// move sequence that reaches the goal.

(() => {
  const H = window.__h;
  const B = (H.brain = { log: [] });

  const UP = 1, DOWN = 2, LEFT = 4, RIGHT = 8, FIRE = 16;
  const say = (msg) => {
    const line = `frame ${String(H.frames.length).padStart(6)}  ${msg}`;
    B.log.push(line);
    console.log(line);
  };

  // ---- The tower --------------------------------------------------
  const doorType = (roomId, side) => {
    const doors = H.layout.roomDoors[roomId];
    if (side === "left") return doors.includes(1) ? 1 : doors.includes(4) ? 4 : 0;
    return doors.includes(2) ? 2 : doors.includes(3) ? 3 : 0;
  };

  // Where each of a room's doors meets an elevator shaft.
  function doors(roomId) {
    const room = H.game.getRoom(roomId);
    const out = [];
    const left = doorType(roomId, "left");
    const right = doorType(roomId, "right");
    if (left) out.push({ side: "left", shaft: room.getElevatorLeft(), stop: room.getFloorLevel() * 2 + (left === 1 ? 0 : 1) });
    if (right) out.push({ side: "right", shaft: room.getElevatorRight(), stop: room.getFloorLevel() * 2 + (right === 2 ? 0 : 1) });
    return out;
  }

  // Rooms that cannot be crossed right now, found by failed plans.
  B.blocked = new Set();

  // Shortest route from where the agent is to a room, as a list of
  // hops: ride a shaft to a stop, step into a room through a door,
  // or cross a room to its other door.
  function route(toRoom) {
    const start = H.scene() === "room" ? `R${H.game.roomId}` : `S${H.elevator.getCurrentPosition().x}:${H.elevator.getCurrentPosition().y / 216}`;
    const edges = new Map();
    const add = (a, b, cost, hop) => {
      if (!edges.has(a)) edges.set(a, []);
      edges.get(a).push({ to: b, cost, hop });
    };
    for (let shaft = 1; shaft <= 8; shaft++) {
      for (let stop = 0; stop < 12; stop++) {
        if (stop < 11) {
          add(`S${shaft}:${stop}`, `S${shaft}:${stop + 1}`, 1, null);
          add(`S${shaft}:${stop + 1}`, `S${shaft}:${stop}`, 1, null);
        }
      }
    }
    for (let r = 1; r <= 32; r++) {
      const ds = doors(r);
      for (const d of ds) {
        const s = `S${d.shaft}:${d.stop}`;
        add(s, `R${r}`, 2, { kind: "enter", room: r, door: d });
        add(`R${r}`, s, 2, { kind: "leave", room: r, door: d });
      }
    }
    // Dijkstra.
    const dist = new Map([[start, 0]]);
    const prev = new Map();
    const open = [start];
    while (open.length) {
      open.sort((a, b) => dist.get(a) - dist.get(b));
      const n = open.shift();
      if (n === `R${toRoom}`) break;
      for (const e of edges.get(n) ?? []) {
        if (e.hop?.kind === "leave" && B.blocked.has(`${e.hop.room}:${e.hop.door.side}`)) continue;
        const d = dist.get(n) + e.cost;
        if (d < (dist.get(e.to) ?? Infinity)) {
          dist.set(e.to, d);
          prev.set(e.to, { from: n, e });
          open.push(e.to);
        }
      }
    }
    if (!prev.has(`R${toRoom}`) && start !== `R${toRoom}`) return null;
    const hops = [];
    for (let n = `R${toRoom}`; n !== start; n = prev.get(n).from) hops.unshift({ node: n, ...prev.get(n).e });
    return hops;
  }

  // ---- Elevator control -------------------------------------------
  // Walk the agent to the middle of the elevator car.
  async function intoCar() {
    for (let i = 0; i < 200; i++) {
      const x = H.agent.x;
      if (x >= 132 && x <= 152 && H.agent.action === "stand") return true;
      const key = x < 142 ? RIGHT : LEFT;
      H.run(key, 2);
      H.run(0, 2);
    }
    return false;
  }

  async function rideTo(stop) {
    const target = stop * 216;
    if (H.elevator.getCurrentPosition().y === target) return true;
    if (!(await intoCar())) return false;
    const key = target > H.elevator.getCurrentPosition().y ? DOWN : UP;
    for (let i = 0; i < 2000; i++) {
      const y = H.elevator.getCurrentPosition().y;
      if (H.elevator.isMoving() && Math.abs(target - y) < 216) break;
      H.step(key);
    }
    H.until(() => !H.elevator.isMoving(), 400);
    return H.elevator.getCurrentPosition().y === target;
  }

  // Run out of the elevator into the room on one side.
  async function enterRoom(side) {
    const key = side === "left" ? LEFT : RIGHT;
    const ok = H.until(() => H.scene() === "room" && !H.inTransition(), 600, key);
    H.run(0, 2);
    return ok;
  }

  // ---- Room planning ----------------------------------------------
  const liftKey = () => (H.game.room ? H.game.room.getLiftGroups().map((g) => g.getLifts()[0]).join("/") : "");
  const stateKey = () => `${H.agent.x},${H.agent.y},${H.agent.direction},${liftKey()}`;
  const onLift = () => H.agent.standingOnLift(H.game.room.getLiftGroups()) !== false;

  // Moves the planner can try. Walks are taps of the direction key.
  // Jumps press fire with a direction (a running somersault) or alone
  // (a standing jump in the facing direction), then let the jump play
  // out. Falls happen on their own when a move leaves a ledge.
  const ACTIONS = [
    { name: "L", frames: [LEFT, LEFT, 0, 0] },
    { name: "R", frames: [RIGHT, RIGHT, 0, 0] },
    { name: "LL", frames: [LEFT, LEFT, LEFT, LEFT, LEFT, LEFT, 0, 0] },
    { name: "RR", frames: [RIGHT, RIGHT, RIGHT, RIGHT, RIGHT, RIGHT, 0, 0] },
    { name: "JL", frames: [LEFT | FIRE, LEFT | FIRE, 0, 0] },
    { name: "JR", frames: [RIGHT | FIRE, RIGHT | FIRE, 0, 0] },
    { name: "J", frames: [FIRE, FIRE, 0, 0] },
    { name: "U", lift: UP },
    { name: "D", lift: DOWN },
  ];

  // Lets a jump or fall finish. Returns false if the agent died.
  function settle() {
    for (let i = 0; i < 300; i++) {
      const a = H.agent.action;
      if (a === "fallDown" || H.agent.dieByZapFrames > 0) return false;
      if (a === "stand" || a === "run") return true;
      if (H.inTransition() || H.scene() !== "room") return true;
      H.step(0);
    }
    return false;
  }

  // Performs one action. Returns false if it could not be performed
  // or the agent died doing it.
  function act(a) {
    if (a.lift) {
      if (!onLift()) return false;
      let rode = false;
      for (let i = 0; i < 400; i++) {
        H.step(a.lift);
        if (H.agent.action === "lift") rode = true;
        else if (rode) break;
      }
      H.run(0, 2);
      return rode;
    }
    for (const bits of a.frames) H.step(bits);
    return settle();
  }

  // Breadth-first search over actions until goal() holds.
  function plan(goal, allowExit, maxNodes = 80000) {
    const start = H.snapshot();
    const seen = new Set([stateKey()]);
    let frontier = [{ snap: start, path: [] }];
    let explored = 0;
    while (frontier.length && explored < maxNodes) {
      const next = [];
      for (const node of frontier) {
        for (const a of ACTIONS) {
          H.restore(node.snap);
          if (!act(a)) continue;
          explored++;
          const leaving = H.inTransition() || H.scene() !== "room";
          if (goal()) {
            H.restore(start);
            return node.path.concat(a.name);
          }
          if (leaving && !allowExit) continue;
          if (leaving || H.agent.action !== "stand") continue;
          const k = stateKey();
          if (seen.has(k)) continue;
          seen.add(k);
          next.push({ snap: H.snapshot(), path: node.path.concat(a.name) });
        }
      }
      frontier = next;
    }
    B.lastPlan = { explored, seen: [...seen] };
    H.restore(start);
    return null;
  }

  function execute(path) {
    for (const name of path) act(ACTIONS.find((a) => a.name === name));
  }

  // Leave the current room through a given door.
  async function leaveBy(side) {
    const path = plan(
      () => H.inTransition() && (side === "left" ? H.agent.x < 0 : H.agent.x > 280),
      true,
    );
    if (!path) return false;
    execute(path);
    H.until(() => H.scene() === "elevator" && !H.inTransition(), 600);
    H.run(0, 2);
    return H.scene() === "elevator";
  }

  // ---- Travel -----------------------------------------------------
  async function goToRoom(roomId) {
    for (let attempt = 0; attempt < 12; attempt++) {
      if (H.scene() === "room" && H.game.roomId === roomId) return true;
      const hops = route(roomId);
      if (!hops) {
        say(`no route to room ${roomId}`);
        return false;
      }
      let failed = false;
      for (const hop of hops) {
        if (!hop.hop) continue;
        if (hop.hop.kind === "leave") {
          if (!(await leaveBy(hop.hop.door.side))) {
            say(`cannot leave room ${hop.hop.room} by its ${hop.hop.door.side} door; rerouting`);
            B.blocked.add(`${hop.hop.room}:${hop.hop.door.side}`);
            failed = true;
            break;
          }
        } else if (hop.hop.kind === "enter") {
          const d = hop.hop.door;
          if (H.elevator.getCurrentPosition().x !== d.shaft) {
            say(`expected to be in shaft ${d.shaft} but am in ${H.elevator.getCurrentPosition().x}`);
            failed = true;
            break;
          }
          if (!(await rideTo(d.stop))) {
            say(`could not ride shaft ${d.shaft} to stop ${d.stop}`);
            failed = true;
            break;
          }
          // The room's left door is reached by running right, out of
          // the shaft on the room's left.
          if (!(await enterRoom(d.side === "left" ? "right" : "left"))) {
            say(`could not enter room ${hop.hop.room}`);
            failed = true;
            break;
          }
        }
        await H.yield();
      }
      if (!failed && H.scene() === "room" && H.game.roomId === roomId) return true;
    }
    return false;
  }

  // ---- Searching --------------------------------------------------
  async function searchFurniture(f) {
    const path = plan(() => H.agent.standingOnFurniture() === f, false);
    if (!path) return false;
    execute(path);
    // Hold up until the search completes, then release.
    H.until(() => H.agent.action === "search" && f.getSearchTime() <= 0, 3000, UP);
    H.step(UP);
    H.run(0, 3);
    return !f.isVisible() || f.getKind() === "exit";
  }

  B.pieceRooms = () => {
    const rooms = new Map();
    for (let r = 1; r <= 32; r++) {
      const fs = H.game.getRoom(r).getFurnitureItems().filter((f) => f.isVisible() && f.getContents() === "puzzle");
      if (fs.length) rooms.set(r, fs);
    }
    return rooms;
  };

  B.collectAll = async () => {
    for (;;) {
      const remaining = B.pieceRooms();
      if (!remaining.size) return true;
      // Visit the nearest room that still holds pieces.
      let best = null;
      for (const r of remaining.keys()) {
        const hops = route(r);
        if (hops && (!best || hops.length < best.len)) best = { room: r, len: hops.length };
      }
      if (!best) {
        say(`no route to any of rooms ${[...remaining.keys()].join(", ")}`);
        return false;
      }
      if (!(await goToRoom(best.room))) {
        say(`failed to reach room ${best.room}`);
        return false;
      }
      for (const f of remaining.get(best.room)) {
        const ok = await searchFurniture(f);
        say(`room ${best.room}: ${ok ? "found" : "COULD NOT REACH"} a puzzle piece in the ${f.getKind()} (${H.pc.getFoundedPieces()} of 36)`);
        if (!ok) return false;
        await H.yield();
      }
    }
  };

  B.openDoor = async () => {
    if (!(await goToRoom(20))) return false;
    const door = H.game.getRoom(20).getFurnitureItems().find((f) => f.getKind() === "exit");
    const path = plan(() => H.agent.standingOnFurniture() === door, false);
    if (!path) return false;
    execute(path);
    H.until(() => H.scene() === "elvin", 600, UP);
    H.run(0, 2);
    return H.scene() === "elvin";
  };

  // ---- The pocket computer -----------------------------------------
  // Drives the puzzle desktop through its real controls: the pointer
  // moves 3 pixels a frame across and 2 down, and fire clicks.
  const R = {
    scrollUp: [10, 35, 125, 144],
    scrollDown: [10, 35, 149, 169],
    m1: [56, 103, 128, 148],
    m2: [56, 103, 152, 172],
    flipV: [238, 259, 125, 147],
    flipH: [262, 283, 125, 147],
    off: [238, 259, 149, 171],
    bin: [286, 307, 125, 147],
    color5: [238, 259, 173, 181],
    color7: [262, 283, 173, 181],
    color3: [286, 307, 173, 181],
    slot: (i) => [i % 2 ? 176 : 120, i % 2 ? 223 : 167, i < 2 ? 128 : 152, i < 2 ? 148 : 172],
    drop: (i) => [i % 2 ? 170 : 114, i % 2 ? 176 : 136, i < 2 ? 128 : 147, i < 2 ? 138 : 152],
  };

  const pc = () => H.pc;
  const inside = (r) => pc().pointerX >= r[0] && pc().pointerX <= r[1] && pc().pointerY >= r[2] && pc().pointerY <= r[3];

  // Every piece image must finish loading before the game compares
  // pixels for a merge.
  async function imagesReady() {
    const pieces = [pc().grabbedPuzzle, ...pc().desktop].filter(Boolean);
    for (let i = 0; i < 200; i++) {
      const all = pieces.flatMap((p) => [p, ...p.getOverlapPuzzles()]);
      if (all.every((p) => p.imageData && p.imageData.complete)) return true;
      await H.yield();
    }
    return false;
  }

  function dismissMessage() {
    if (!pc().message) return;
    H.until(() => pc().messageFrame > 200, 400);
    H.step(FIRE);
    H.step(0);
  }

  async function clickAt(r) {
    dismissMessage();
    const tx = Math.round((r[0] + r[1]) / 2);
    const ty = Math.round((r[2] + r[3]) / 2);
    for (let i = 0; i < 400 && !(inside(r) && Math.abs(pc().pointerX - tx) < 3 && Math.abs(pc().pointerY - ty) < 2); i++) {
      let bits = 0;
      if (pc().pointerX < tx - 1) bits |= RIGHT;
      else if (pc().pointerX > tx + 1) bits |= LEFT;
      if (pc().pointerY < ty - 1) bits |= DOWN;
      else if (pc().pointerY > ty + 1) bits |= UP;
      if (!bits) break;
      H.step(bits);
    }
    H.step(FIRE);
    H.step(0);
    await imagesReady();
    if (pc().message) {
      say(`pocket computer says "${pc().message}"`);
      dismissMessage();
      return false;
    }
    return true;
  }

  // Scroll the memory window so `piece` shows as m1 or m2, then grab it.
  async function grab(piece) {
    for (let i = 0; i < 80; i++) {
      const at = pc().memory.indexOf(piece);
      const idx = pc().memoryIndex;
      if (at === idx) return clickAt(R.m1);
      if (at === idx + 1) return clickAt(R.m2);
      await clickAt(at > idx ? R.scrollUp : R.scrollDown);
    }
    return false;
  }

  async function normalize(slot, color) {
    const p = pc().desktop[slot];
    if (pc().selectedDesktop !== slot) await clickAt(R.slot(slot));
    if (p.getFlipV()) await clickAt(R.flipV);
    if (pc().desktop[slot] && pc().desktop[slot].getFlipH()) await clickAt(R.flipH);
    if (pc().desktop[slot] && pc().desktop[slot].getColor() !== color) await clickAt(R[`color${color}`]);
  }

  async function solveSet(set) {
    // Clear any copies left on the staging slots by the last card.
    // Picking a piece up off the desktop copies it rather than moving
    // it, so a stacked piece leaves its staging copy behind.
    for (let i = 1; i < 4; i++) {
      if (pc().desktop[i]) {
        if (pc().selectedDesktop !== i) await clickAt(R.slot(i));
        await clickAt(R.bin);
      }
    }
    const pieces = pc().memory.filter((p) => p && p.getSet() === set);
    if (pieces.length !== 4) {
      say(`card ${set + 1} has only ${pieces.length} of its pieces`);
      return false;
    }
    const solvedBefore = pc().getSolvedPuzzles();
    const base = pieces[0];
    const color = base.getColor();
    if (!(await grab(base)) || !(await clickAt(R.drop(0)))) return false;
    await normalize(0, color);
    for (const [n, p] of pieces.slice(1).entries()) {
      const slot = n + 1;
      if (!(await grab(p)) || !(await clickAt(R.drop(slot)))) return false;
      await normalize(slot, color);
      // Pick the staged piece back up and stack it on the base.
      await clickAt(R.slot(slot));
      if (!pc().grabbedPuzzle) await clickAt(R.slot(slot));
      if (!(await clickAt(R.drop(0)))) {
        say(`card ${set + 1}: a piece would not stack`);
        return false;
      }
    }
    return pc().getSolvedPuzzles() === solvedBefore + 1;
  }

  B.solveAll = async () => {
    // Stand in an elevator car and open the pocket computer.
    if (H.scene() === "room") {
      const ds = doors(H.game.roomId);
      let out = false;
      for (const d of ds) if (!out) out = await leaveBy(d.side);
      if (!out) return false;
    }
    if (!(await intoCar())) return false;
    H.draw = true;
    H.run(0, 2);
    H.step(FIRE);
    H.step(0);
    if (pc().getState() !== "puzzles") {
      say("the pocket computer did not open");
      return false;
    }
    for (let set = 0; set < 9; set++) {
      const ok = await solveSet(set);
      say(`card ${set + 1}: ${ok ? "solved" : "NOT solved"}, password "${H.game.getSolvedPassword()}"`);
      if (!ok) return false;
    }
    await clickAt(R.off);
    H.draw = false;
    return pc().getState() === "map";
  };

  // ---- Reachability survey ----------------------------------------
  // Enters a room through one door, with its lifts as they start, and
  // explores every move sequence the planner can find, recording the
  // furniture the agent can stand in front of and the doors it can
  // leave by. Room geometry depends only on the room, so this holds
  // for every layout.
  B.survey = async (roomId, side) => {
    const d = doors(roomId).find((x) => x.side === side);
    if (!d) return null;
    const room = H.game.getRoom(roomId);
    room.resetLifts();
    H.scenes.setScene("elevator");
    H.elevator.setShaft(d.shaft);
    H.elevator.setY(d.stop * 216);
    H.game.enterRoom(side === "left" ? "right" : "left");
    H.until(() => H.scene() === "room" && !H.inTransition(), 200);
    H.run(0, 2);
    const reached = new Set();
    const exits = new Set();
    const items = room.getFurnitureItems();
    plan(() => {
      const f = H.agent.standingOnFurniture();
      if (f) reached.add(items.indexOf(f));
      if (H.inTransition()) exits.add(H.agent.x < 150 ? "left" : "right");
      return false;
    }, true, 400000);
    return {
      room: roomId,
      from: side,
      explored: B.lastPlan.explored,
      unreachable: items.map((f, i) => ({ i, f })).filter(({ i }) => !reached.has(i)).map(({ f }) => `${f.getKind()}@${f.getLeft()},${f.getBottom()}`),
      reachable: reached.size,
      total: items.length,
      exits: [...exits],
    };
  };

  B.helpers = { route, goToRoom, rideTo, enterRoom, leaveBy, plan, execute, act, searchFurniture, say };
})();
