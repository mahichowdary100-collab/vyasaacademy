"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const SNL = require("./snl-engine.js");

test("cellPosition maps serpentine squares correctly", () => {
  assert.deepEqual(SNL.cellPosition(1), { row: 0, col: 0 });
  assert.deepEqual(SNL.cellPosition(10), { row: 0, col: 9 });
  assert.deepEqual(SNL.cellPosition(11), { row: 1, col: 9 });
  assert.deepEqual(SNL.cellPosition(20), { row: 1, col: 0 });
  assert.deepEqual(SNL.cellPosition(21), { row: 2, col: 0 });
  assert.deepEqual(SNL.cellPosition(100), { row: 9, col: 0 });
});

test("cellPosition rejects out-of-range squares", () => {
  assert.throws(() => SNL.cellPosition(0), RangeError);
  assert.throws(() => SNL.cellPosition(101), RangeError);
});

test("numberAt is the inverse of cellPosition for all squares", () => {
  for (let n = 1; n <= 100; n++) {
    const c = SNL.cellPosition(n);
    assert.equal(SNL.numberAt(c.row, c.col), n);
  }
});

test("board row parity: row 0 left-to-right, row 1 right-to-left", () => {
  assert.equal(SNL.numberAt(0, 0), 1);
  assert.equal(SNL.numberAt(0, 9), 10);
  assert.equal(SNL.numberAt(1, 9), 11);
  assert.equal(SNL.numberAt(1, 0), 20);
});

test("resolve follows snakes down", () => {
  assert.equal(SNL.resolve(16), 6);
  assert.equal(SNL.resolve(47), 26);
  assert.equal(SNL.resolve(98), 78);
});

test("resolve follows ladders up", () => {
  assert.equal(SNL.resolve(1), 38);
  assert.equal(SNL.resolve(80), 100);
  assert.equal(SNL.resolve(28), 84);
});

test("resolve leaves ordinary squares unchanged", () => {
  assert.equal(SNL.resolve(2), 2);
  assert.equal(SNL.resolve(100), 100);
  assert.equal(SNL.resolve(55), 55);
});

test("landingType classifies heads, ladder bottoms and plain squares", () => {
  assert.equal(SNL.landingType(16), "snake");
  assert.equal(SNL.landingType(1), "ladder");
  assert.equal(SNL.landingType(2), null);
});

test("movePath enumerates stepped squares", () => {
  assert.deepEqual(SNL.movePath(1, 6), [2, 3, 4, 5, 6, 7]);
  assert.deepEqual(SNL.movePath(95, 5), [96, 97, 98, 99, 100]);
  assert.deepEqual(SNL.movePath(99, 1), [100]);
});

test("movePath is empty when the roll overshoots 100", () => {
  assert.deepEqual(SNL.movePath(97, 5), []);
  assert.deepEqual(SNL.movePath(99, 6), []);
  assert.deepEqual(SNL.movePath(100, 1), []);
});

test("rollDie stays within 1..6", () => {
  assert.equal(SNL.rollDie(() => 0), 1);
  assert.equal(SNL.rollDie(() => 0.999999), 6);
  assert.equal(SNL.rollDie(() => 0.5), 4);
  for (let i = 0; i < 500; i++) {
    const r = SNL.rollDie();
    assert.ok(r >= 1 && r <= 6 && Number.isInteger(r));
  }
});

test("rollDie tolerates a broken rng", () => {
  const r = SNL.rollDie(() => 7);
  assert.ok(r >= 1 && r <= 6);
});

test("mulberry32 is deterministic", () => {
  const a = SNL.mulberry32(42);
  const b = SNL.mulberry32(42);
  for (let i = 0; i < 10; i++) { assert.equal(a(), b()); }
});

test("new game starts both players on square 1 with player 1 to move", () => {
  const g = new SNL.Game();
  assert.equal(g.players[0].position, 1);
  assert.equal(g.players[1].position, 1);
  assert.equal(g.current, 0);
  assert.equal(g.phase, "idle");
  assert.equal(g.turnCount, 0);
  assert.equal(g.winner, null);
});

test("roll returns a plan describing the move", () => {
  const g = new SNL.Game();
  const plan = g.roll(4);
  assert.equal(plan.roll, 4);
  assert.equal(plan.playerId, 0);
  assert.equal(plan.from, 1);
  assert.deepEqual(plan.path, [2, 3, 4, 5]);
  assert.equal(plan.to, 5);
  assert.equal(plan.special, null);
  assert.equal(plan.win, false);
  assert.equal(g.phase, "animating");
});

test("a second roll is rejected until the turn is committed", () => {
  const g = new SNL.Game();
  g.roll(4);
  assert.equal(g.roll(4), null);
  assert.equal(g.phase, "animating");
});

test("commit applies movement, advances the turn and counts turns", () => {
  const g = new SNL.Game();
  const plan = g.roll(4);
  g.commit(plan);
  assert.equal(g.players[0].position, 5);
  assert.equal(g.current, 1);
  assert.equal(g.phase, "idle");
  assert.equal(g.turnCount, 1);
});

test("players alternate over several turns", () => {
  const g = new SNL.Game();
  const order = [];
  for (let i = 0; i < 4; i++) {
    order.push(g.current);
    g.commit(g.roll(1));
  }
  assert.deepEqual(order, [0, 1, 0, 1]);
});

test("landing on a snake head slides the token to the tail", () => {
  const g = new SNL.Game();
  g.players[0].position = 15;
  const plan = g.roll(1);
  assert.equal(plan.landed, 16);
  assert.equal(plan.special, "snake");
  assert.equal(plan.specialFrom, 16);
  assert.equal(plan.specialTo, 6);
  assert.equal(plan.to, 6);
  g.commit(plan);
  assert.equal(g.players[0].position, 6);
});

test("landing on a ladder bottom climbs to the top", () => {
  const g = new SNL.Game();
  g.players[0].position = 3;
  const plan = g.roll(1);
  assert.equal(plan.landed, 4);
  assert.equal(plan.special, "ladder");
  assert.equal(plan.to, 14);
  g.commit(plan);
  assert.equal(g.players[0].position, 14);
});

test("a ladder that reaches 100 wins the game", () => {
  const g = new SNL.Game();
  g.players[0].position = 79;
  const plan = g.roll(1);
  assert.equal(plan.landed, 80);
  assert.equal(plan.special, "ladder");
  assert.equal(plan.to, 100);
  assert.equal(plan.win, true);
  g.commit(plan);
  assert.equal(g.winner, 0);
  assert.equal(g.phase, "won");
});

test("an exact roll onto 100 wins directly", () => {
  const g = new SNL.Game();
  g.players[0].position = 95;
  const plan = g.roll(5);
  assert.equal(plan.to, 100);
  assert.equal(plan.win, true);
  g.commit(plan);
  assert.equal(g.winner, 0);
  assert.equal(g.phase, "won");
});

test("overshooting 100 leaves the player in place and passes the turn", () => {
  const g = new SNL.Game();
  g.players[0].position = 97;
  const plan = g.roll(5);
  assert.equal(plan.overshoot, true);
  assert.deepEqual(plan.path, []);
  assert.equal(plan.to, 97);
  assert.equal(plan.win, false);
  g.commit(plan);
  assert.equal(g.players[0].position, 97);
  assert.equal(g.current, 1);
});

test("no further rolls are allowed after a win", () => {
  const g = new SNL.Game();
  g.players[0].position = 95;
  g.commit(g.roll(5));
  assert.equal(g.phase, "won");
  assert.equal(g.roll(3), null);
});

test("reset returns the game to a fresh state", () => {
  const g = new SNL.Game({ p1Name: "Asha", p2Name: "Ravi" });
  g.players[0].position = 97;
  g.commit(g.roll(1));
  g.reset({ p1Name: "Asha", p2Name: "Ravi" });
  assert.equal(g.players[0].position, 1);
  assert.equal(g.players[1].position, 1);
  assert.equal(g.current, 0);
  assert.equal(g.turnCount, 0);
  assert.equal(g.phase, "idle");
  assert.equal(g.winner, null);
});

test("forced rolls are clamped into 1..6", () => {
  const g = new SNL.Game();
  const p1 = g.roll(0);
  assert.equal(p1.roll, 1);
  g.commit(p1);
  const p2 = g.roll(9);
  assert.equal(p2.roll, 6);
});

test("snapshot reports a serialisable state", () => {
  const g = new SNL.Game();
  g.commit(g.roll(2));
  const s = g.snapshot();
  assert.equal(s.players.length, 2);
  assert.equal(s.players[0].position, 3);
  assert.equal(s.current, 1);
  assert.equal(s.turnCount, 1);
  assert.equal(s.isOver, false);
});

test("board data is complete and self-consistent", () => {
  const tiles = SNL.boardTiles();
  assert.equal(tiles.length, 100);
  assert.equal(SNL.snakeList().length, 10);
  assert.equal(SNL.ladderList().length, 9);
  for (const s of SNL.snakeList()) { assert.ok(s.from > s.to); }
  for (const l of SNL.ladderList()) { assert.ok(l.from < l.to); }
});

test("no square is both a snake head and a ladder bottom", () => {
  const heads = Object.keys(SNL.SNAKES).map(Number);
  const bases = Object.keys(SNL.LADDERS).map(Number);
  for (const h of heads) { assert.ok(bases.indexOf(h) === -1); }
});

test("every snake tail and ladder top lies on the board", () => {
  for (const k in SNL.SNAKES) {
    assert.ok(SNL.SNAKES[k] >= 1 && SNL.SNAKES[k] <= 100);
  }
  for (const k in SNL.LADDERS) {
    assert.ok(SNL.LADDERS[k] >= 1 && SNL.LADDERS[k] <= 100);
  }
});

test("a full seeded game always terminates with a winner", () => {
  const g = new SNL.Game({ rng: SNL.mulberry32(7) });
  let guard = 0;
  while (!g.isOver() && guard < 5000) {
    const plan = g.roll();
    g.commit(plan);
    guard++;
  }
  assert.ok(g.isOver(), "game should finish");
  assert.ok(g.winner === 0 || g.winner === 1);
  assert.equal(g.players[g.winner].position, 100);
});
