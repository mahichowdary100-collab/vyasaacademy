/*
 * Vyasa 3D Snakes & Ladders - pure game engine (no DOM, no 3D).
 * UMD: works as a CommonJS module (node --test) and as window.SNL in the browser.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else if (typeof window === "object") {
    window.SNL = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var VERSION = "1.0.0";
  var BOARD_SIZE = 10;
  var LAST = BOARD_SIZE * BOARD_SIZE;

  // Standard Snakes & Ladders board (head -> tail).
  var SNAKES = {
    16: 6, 47: 26, 49: 11, 56: 53, 62: 19,
    64: 60, 87: 24, 93: 73, 95: 75, 98: 78
  };
  // Bottom -> top.
  var LADDERS = {
    1: 38, 4: 14, 9: 31, 21: 42, 28: 84,
    36: 44, 51: 67, 71: 91, 80: 100
  };

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  // Square number (1..100) -> grid coordinates { row, col } (0-based, row 0 = bottom).
  function cellPosition(n) {
    n = Math.round(n);
    if (n < 1 || n > LAST) { throw new RangeError("square out of range: " + n); }
    var idx = n - 1;
    var row = Math.floor(idx / BOARD_SIZE);
    var col = idx % BOARD_SIZE;
    if (row % 2 === 1) { col = BOARD_SIZE - 1 - col; }
    return { row: row, col: col };
  }

  // Grid coordinates -> square number. Inverse of cellPosition.
  function numberAt(row, col) {
    var n = row * BOARD_SIZE + (row % 2 === 0 ? col + 1 : BOARD_SIZE - col);
    return n;
  }

  // Follow a snake or ladder from a square. Loops are guarded against.
  function resolve(pos) {
    var seen = {};
    var cur = pos;
    for (var i = 0; i < LAST + 1; i++) {
      if (seen[cur]) { break; }
      seen[cur] = true;
      if (SNAKES[cur] != null) { cur = SNAKES[cur]; continue; }
      if (LADDERS[cur] != null) { cur = LADDERS[cur]; continue; }
      break;
    }
    return cur;
  }

  // "snake" | "ladder" | null for the square a player has just landed on.
  function landingType(pos) {
    if (SNAKES[pos] != null) { return "snake"; }
    if (LADDERS[pos] != null) { return "ladder"; }
    return null;
  }

  // Roll 1..6 using an optional rng (defaults to Math.random). Robust to bad rng values.
  function rollDie(rng) {
    var r = (typeof rng === "function") ? rng() : Math.random();
    if (typeof r !== "number" || !isFinite(r) || r < 0 || r >= 1) { r = Math.random(); }
    return Math.floor(r * 6) + 1;
  }

  // Squares stepped through when moving "roll" from "from".
  // Returns [] when the move would overshoot 100 (player stays put).
  function movePath(from, roll) {
    var path = [];
    if (from + roll > LAST) { return path; }
    for (var s = 1; s <= roll; s++) { path.push(from + s); }
    return path;
  }

  // Deterministic RNG for tests and daily boards.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function boardTiles() {
    var list = [];
    for (var n = 1; n <= LAST; n++) {
      var c = cellPosition(n);
      list.push({ n: n, row: c.row, col: c.col });
    }
    return list;
  }

  function snakeList() {
    return Object.keys(SNAKES).map(function (k) {
      return { from: Number(k), to: SNAKES[k] };
    });
  }

  function ladderList() {
    return Object.keys(LADDERS).map(function (k) {
      return { from: Number(k), to: LADDERS[k] };
    });
  }

  function Game(opts) {
    opts = opts || {};
    this.players = [
      { id: 0, name: opts.p1Name || "Player 1", color: "blue", position: 1 },
      { id: 1, name: opts.p2Name || "Player 2", color: "red", position: 1 }
    ];
    this.current = 0;
    this.turnCount = 0;
    this.phase = "idle"; // idle | animating | won
    this.lastRoll = null;
    this.winner = null;
    this.rng = opts.rng || Math.random;
  }

  Game.prototype.currentPlayer = function () { return this.players[this.current]; };
  Game.prototype.otherPlayer = function () { return this.players[1 - this.current]; };
  Game.prototype.isOver = function () { return this.phase === "won"; };

  // Begin a turn. Returns an animation plan, or null if a roll is not allowed now.
  Game.prototype.roll = function (forcedRoll) {
    if (this.phase !== "idle") { return null; }
    var roll = (forcedRoll != null) ? clamp(Math.round(forcedRoll), 1, 6) : rollDie(this.rng);
    var p = this.currentPlayer();
    var from = p.position;
    var path = movePath(from, roll);
    var overshoot = path.length === 0;
    var landed = overshoot ? from : path[path.length - 1];
    var special = overshoot ? null : landingType(landed);
    var finalPos = overshoot ? from : resolve(landed);

    this.phase = "animating";
    this.lastRoll = roll;
    return {
      roll: roll,
      playerId: this.current,
      from: from,
      path: path,
      overshoot: overshoot,
      landed: landed,
      special: special,
      specialFrom: special ? landed : null,
      specialTo: special ? finalPos : null,
      to: finalPos,
      win: finalPos === LAST
    };
  };

  // Apply a completed plan and hand over the turn.
  Game.prototype.commit = function (plan) {
    if (!plan) { return; }
    var p = this.players[plan.playerId];
    p.position = plan.to;
    this.turnCount += 1;
    this.lastRoll = plan.roll;
    if (plan.win) {
      this.winner = plan.playerId;
      this.phase = "won";
    } else {
      this.phase = "idle";
      this.current = 1 - this.current;
    }
  };

  Game.prototype.reset = function (opts) {
    opts = opts || {};
    this.players[0].position = 1;
    this.players[1].position = 1;
    if (opts.p1Name != null) { this.players[0].name = String(opts.p1Name) || "Player 1"; }
    if (opts.p2Name != null) { this.players[1].name = String(opts.p2Name) || "Player 2"; }
    this.current = 0;
    this.turnCount = 0;
    this.phase = "idle";
    this.lastRoll = null;
    this.winner = null;
  };

  Game.prototype.snapshot = function () {
    return {
      players: this.players.map(function (p) {
        return { id: p.id, name: p.name, color: p.color, position: p.position };
      }),
      current: this.current,
      turnCount: this.turnCount,
      phase: this.phase,
      lastRoll: this.lastRoll,
      winner: this.winner,
      isOver: this.isOver()
    };
  };

  return {
    VERSION: VERSION,
    BOARD_SIZE: BOARD_SIZE,
    LAST: LAST,
    SNAKES: SNAKES,
    LADDERS: LADDERS,
    clamp: clamp,
    cellPosition: cellPosition,
    numberAt: numberAt,
    resolve: resolve,
    landingType: landingType,
    rollDie: rollDie,
    movePath: movePath,
    mulberry32: mulberry32,
    boardTiles: boardTiles,
    snakeList: snakeList,
    ladderList: ladderList,
    Game: Game
  };
});
