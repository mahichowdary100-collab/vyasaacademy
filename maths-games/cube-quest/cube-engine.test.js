/* =====================================================================
 * CUBE QUEST - engine unit tests
 * Run:  node --test maths-games/cube-quest/cube-engine.test.js
 * Uses Node's built-in test runner (no extra dependencies).
 * ===================================================================== */
"use strict";

const test = require("node:test");
const assert = require("node:assert");
const CQ = require("./cube-engine.js");

const SUP_REV = { "\u2070": "0", "\u00b9": "1", "\u00b2": "2", "\u00b3": "3", "\u2074": "4", "\u2075": "5", "\u2076": "6", "\u2077": "7", "\u2078": "8", "\u2079": "9" };
function parseFactorisation(str) {
  // "2³ × 3³" -> 216
  let value = 1;
  str.split("\u00d7").forEach((term) => {
    term = term.trim();
    const m = term.match(/^(\d+)(.*)$/);
    if (!m) { return; }
    const base = parseInt(m[1], 10);
    let exp = "";
    for (const ch of m[2]) { exp += SUP_REV[ch] || ""; }
    value *= Math.pow(base, exp === "" ? 1 : parseInt(exp, 10));
  });
  return value;
}

/* 1. Cube calculation accuracy ------------------------------------ */
test("cube(): exact for the whole school range", () => {
  for (let n = 0; n <= 60; n++) { assert.strictEqual(CQ.cube(n), n * n * n); }
  assert.strictEqual(CQ.cube(0), 0);
  assert.strictEqual(CQ.cube(1), 1);
  assert.strictEqual(CQ.cube(-3), -27);
});

/* 2. Exact cube-root validation ----------------------------------- */
test("integerCubeRoot(): exact only, never a rounded value", () => {
  assert.strictEqual(CQ.integerCubeRoot(0), 0);
  assert.strictEqual(CQ.integerCubeRoot(1), 1);
  assert.strictEqual(CQ.integerCubeRoot(27), 3);
  assert.strictEqual(CQ.integerCubeRoot(1000), 10);
  assert.strictEqual(CQ.integerCubeRoot(15625), 25);
  assert.strictEqual(CQ.integerCubeRoot(-27), -3);
  // non-cubes must return null (never a rounded 2.99...)
  [26, 28, 2, 63, 65, 124, 999, 1001].forEach((n) => {
    assert.strictEqual(CQ.integerCubeRoot(n), null, `${n} should not have an exact cube root`);
  });
});

/* 3. Perfect-cube classification ---------------------------------- */
test("isPerfectCube(): boundaries and non-cubes", () => {
  assert.strictEqual(CQ.isPerfectCube(0), true);
  assert.strictEqual(CQ.isPerfectCube(1), true);
  assert.strictEqual(CQ.isPerfectCube(8), true);
  assert.strictEqual(CQ.isPerfectCube(343), true);
  assert.strictEqual(CQ.isPerfectCube(500), false);
  assert.strictEqual(CQ.isPerfectCube(2), false);
  assert.strictEqual(CQ.isPerfectCube(63), false);
});

test("isPerfectCubeByFactors(): exponent rule agrees with direct check", () => {
  for (let n = 1; n <= 500; n++) {
    assert.strictEqual(CQ.isPerfectCubeByFactors(n), CQ.isPerfectCube(n), `mismatch at ${n}`);
  }
  // prime exponent not a multiple of three
  assert.strictEqual(CQ.isPerfectCubeByFactors(108), false); // 2² × 3³
  assert.strictEqual(CQ.isPerfectCubeByFactors(216), true);  // 2³ × 3³
});

/* 4. Prime factorisation ------------------------------------------ */
test("factorize()/formatFactorisation()", () => {
  assert.deepStrictEqual(CQ.factorize(216), { 2: 3, 3: 3 });
  assert.deepStrictEqual(CQ.factorize(1), {});
  assert.deepStrictEqual(CQ.factorize(97), { 97: 1 });
  assert.strictEqual(CQ.formatFactorisation(216), "2\u00b3 \u00d7 3\u00b3");
  assert.strictEqual(CQ.formatFactorisation(1), "1");
});

/* 5. Minimum multiplier / divisor --------------------------------- */
test("minMultiplierToCube(): smallest positive integer", () => {
  assert.strictEqual(CQ.minMultiplierToCube(108), 2);   // 108 × 2 = 216 = 6³
  assert.strictEqual(CQ.minMultiplierToCube(40), 25);   // 40 × 25 = 1000 = 10³
  assert.strictEqual(CQ.minMultiplierToCube(27), 1);    // already a cube
  assert.strictEqual(CQ.minMultiplierToCube(500), 2);   // 2² × 5³ -> ×2
});

test("minDivisorToCube(): smallest positive integer", () => {
  assert.strictEqual(CQ.minDivisorToCube(108), 4);      // 108 / 4 = 27 = 3³
  assert.strictEqual(CQ.minDivisorToCube(216), 1);      // already a cube
  assert.strictEqual(CQ.minDivisorToCube(500), 4);      // 500 / 4 = 125 = 5³
});

/* 6. Question-generator validity ---------------------------------- */
test("generateQuestion(): valid structure and self-consistent answers", () => {
  CQ.TOPIC_IDS.forEach((topic) => {
    [1, 2, 3].forEach((diff) => {
      const rng = CQ.seededRng(topic.length * 100 + diff);
      for (let i = 0; i < 60; i++) {
        const q = CQ.generateQuestion({ topic, difficulty: diff, rng });
        assert.ok(q.id && typeof q.id === "string", "id present");
        assert.strictEqual(q.topic, topic);
        assert.ok([1, 2, 3].includes(q.difficulty));
        assert.ok(q.prompt && q.prompt.length > 0, "prompt");
        assert.ok(q.explanation && q.explanation.length > 0, "explanation");
        assert.ok(q.hint && q.hint.length > 0, "hint");
        if (q.kind === "number") {
          assert.ok(Number.isInteger(q.answer), `${topic}: numeric answer must be integer`);
          const r = CQ.checkAnswer(q, q.answer);
          assert.ok(r.correct, `${topic}: canonical answer must check out`);
        } else if (q.kind === "choice") {
          assert.strictEqual(q.options.length, 4, `${topic}: 4 options`);
          assert.ok(q.correctIndex >= 0 && q.correctIndex < 4, `${topic}: correctIndex in range`);
          assert.strictEqual(new Set(q.options).size, 4, `${topic}: distinct options`);
          assert.ok(CQ.checkAnswer(q, q.correctIndex).correct);
          assert.ok(CQ.checkAnswer(q, q.options[q.correctIndex]).correct);
        } else if (q.kind === "boolean") {
          assert.strictEqual(typeof q.answer, "boolean");
          assert.ok(CQ.checkAnswer(q, q.answer ? "yes" : "no").correct);
          assert.ok(!CQ.checkAnswer(q, q.answer ? "no" : "yes").correct);
        } else {
          assert.fail("unknown kind " + q.kind);
        }
      }
    });
  });
});

test("generated cube/root questions are mathematically correct", () => {
  const rng = CQ.seededRng(7);
  for (let i = 0; i < 50; i++) {
    const q = CQ.generateQuestion({ topic: "cube", difficulty: 2, rng });
    if (q.kind === "number") {
      const n = parseInt(q.prompt.match(/Find (\d+)\u00b3/)[1], 10);
      assert.strictEqual(q.answer, CQ.cube(n));
    }
    const r = CQ.generateQuestion({ topic: "cuberoot", difficulty: 2, rng });
    if (r.kind === "number") {
      const val = parseInt(r.prompt.match(/\u221b(\d+)/)[1], 10);
      assert.strictEqual(CQ.cube(r.answer), val);
    }
  }
});

test("checkAnswer(): tolerance, rejections and purity", () => {
  const q = { kind: "number", answer: 216, acceptable: [] };
  assert.ok(CQ.checkAnswer(q, "216").correct);
  assert.ok(CQ.checkAnswer(q, " 216 ").correct);
  assert.ok(CQ.checkAnswer(q, "216.0").correct);
  assert.ok(!CQ.checkAnswer(q, "215").correct);
  assert.ok(!CQ.checkAnswer(q, "abc").correct);
  assert.ok(!CQ.checkAnswer(q, "").correct);
  assert.strictEqual(CQ.normaliseAnswer("1,000"), 1000);
  assert.strictEqual(CQ.normaliseAnswer("\u221b27"), 27);
  const before = JSON.stringify(q);
  CQ.checkAnswer(q, 999);
  assert.strictEqual(JSON.stringify(q), before, "checkAnswer must not mutate the question");
});

/* 7. Matching-game answer validation ------------------------------ */
test("matchingPairs(): left/right relationships are valid", () => {
  const rng = CQ.seededRng(42);
  const kinds = ["num-cube", "cube-root", "expr-value", "factor-root", "diagram-count"];
  kinds.forEach((type) => {
    const pairs = CQ.matchingPairs(type, 6, rng, 12);
    assert.strictEqual(pairs.length, 6);
    pairs.forEach((p) => {
      if (type === "num-cube") {
        assert.strictEqual(CQ.cube(parseInt(p.left, 10)), parseInt(p.right, 10));
      } else if (type === "cube-root") {
        assert.strictEqual(CQ.cube(parseInt(p.right, 10)), parseInt(p.left, 10));
      } else if (type === "expr-value") {
        assert.strictEqual(CQ.cube(parseInt(p.left, 10)), parseInt(p.right, 10));
      } else if (type === "factor-root") {
        const n = parseFactorisation(p.left);
        assert.strictEqual(CQ.integerCubeRoot(n), parseInt(p.right, 10));
      } else {
        assert.strictEqual(CQ.cube(p.diagram), parseInt(p.right, 10));
      }
    });
  });
});

/* 9. Score and streak calculations -------------------------------- */
test("scoreAnswer(): accuracy weighted above speed, bounded streak bonus", () => {
  assert.strictEqual(CQ.scoreAnswer(false, 3, 0, 10), 0);
  const easySlow = CQ.scoreAnswer(true, 1, 1, 1);
  const hardFast = CQ.scoreAnswer(true, 3, 0, 1);
  assert.ok(hardFast > easySlow, "harder fast answer scores more than easy slow answer");
  assert.ok(CQ.scoreAnswer(true, 2, 0, 1) > CQ.scoreAnswer(true, 2, 1, 1), "time bonus");
  assert.ok(CQ.scoreAnswer(true, 1, 0, 100) <= CQ.scoreAnswer(true, 1, 0, 1) + 10, "streak bonus capped");
});

/* 11. Bot behaviour ----------------------------------------------- */
test("botResolve(): reproducible with a seed, no hidden advantage", () => {
  const bot = CQ.BOTS.pro;
  const run = (seed) => {
    const rng = CQ.seededRng(seed);
    const out = [];
    for (let i = 0; i < 20; i++) {
      const q = CQ.generateQuestion({ topic: "cube", difficulty: 2, rng: CQ.seededRng(seed + i) });
      out.push(CQ.botResolve(q, bot, rng));
    }
    return out;
  };
  assert.deepStrictEqual(run(123), run(123), "same seed -> same battle line");
  const rng = CQ.seededRng(9);
  for (let i = 0; i < 100; i++) {
    const q = CQ.generateQuestion({ topic: "cube", difficulty: 1, rng });
    const r = CQ.botResolve(q, bot, rng);
    if (r.correct) {
      const expected = q.kind === "choice" ? q.correctIndex : q.answer;
      assert.strictEqual(r.answer, expected, "when correct the bot gives the right answer");
    }
    assert.ok(r.ms >= 1200, "response time is realistic");
  }
});

test("botResolve(): long-run accuracy tracks the configured skill", () => {
  const rng = CQ.seededRng(2024);
  const bot = CQ.BOTS.rookie;
  let correct = 0;
  const N = 4000;
  for (let i = 0; i < N; i++) {
    const q = { kind: "number", answer: 100 + i, difficulty: 1, topic: "cube" };
    if (CQ.botResolve(q, bot, rng).correct) { correct++; }
  }
  const acc = correct / N;
  assert.ok(Math.abs(acc - bot.skill) < 0.05, `accuracy ${acc} should be near skill ${bot.skill}`);
});

/* 12. Adaptive difficulty ----------------------------------------- */
test("adapt(): increases after a hot streak, decreases after misses", () => {
  const s = CQ.newAdaptiveState();
  const q = { topic: "cube", difficulty: 1 };
  for (let i = 0; i < 3; i++) { CQ.recordResult(s, q, true, 3000, false); }
  const up = CQ.adapt(s);
  assert.ok(up.level >= 1);
  assert.ok(typeof up.reason === "string" && up.reason.length > 0, "explains the change");

  const s2 = CQ.newAdaptiveState();
  for (let i = 0; i < 3; i++) { CQ.recordResult(s2, q, false, 3000, false); }
  CQ.adapt(s2);
  assert.strictEqual(s2.level, 1, "never drops below the floor");
});

test("adapt(): a fast guess on a hard item is not treated as mastery", () => {
  const s = CQ.newAdaptiveState();
  const hard = { topic: "cube", difficulty: 3 };
  for (let i = 0; i < 5; i++) { CQ.recordResult(s, hard, true, 800, false); }
  assert.ok(s.fastGuesses >= 2, "fast guesses detected");
});

/* 13. Escape-room progression ------------------------------------- */
test("escape rooms: every puzzle has a determinate, correct answer", () => {
  assert.deepStrictEqual(CQ.validateEscapeRooms(), [], "no invalid puzzles");
  assert.strictEqual(CQ.ROOMS.length, 5);
  CQ.ROOMS.forEach((room) => {
    const puzzles = CQ.roomPuzzles(room);
    assert.strictEqual(puzzles.length, 3, `room ${room.id} has 3 puzzles`);
    puzzles.forEach((p) => {
      if (p.kind === "boolean") { assert.strictEqual(typeof p.answer, "boolean"); }
      else if (p.kind === "choice") { assert.ok(p.correctIndex >= 0 && p.correctIndex < p.options.length); }
      else { assert.ok(Number.isInteger(p.answer)); }
    });
  });
  // The multi-step final lock is provably 10.
  const finalLock = CQ.roomPuzzles(CQ.ROOMS[4])[0];
  assert.strictEqual(finalLock.answer, 10);
});

/* 14. XP and achievement rules ------------------------------------ */
test("levelFromXp(): thresholds are consistent", () => {
  assert.strictEqual(CQ.levelFromXp(0).level, 1);
  assert.strictEqual(CQ.levelFromXp(99).level, 1);
  assert.strictEqual(CQ.levelFromXp(100).level, 2);
  assert.strictEqual(CQ.levelFromXp(399).level, 2);
  assert.strictEqual(CQ.levelFromXp(400).level, 3);
  const r = CQ.levelFromXp(250);
  assert.ok(r.pct >= 0 && r.pct <= 100);
});

test("achievements: earned flags and newlyEarned diff", () => {
  const s = CQ.blankStats();
  const before = CQ.achievementStatus(s);
  assert.ok(before.every((a) => a.earned === false), "nothing earned at zero");
  s.correct = 1;
  const after = CQ.achievementStatus(s);
  assert.ok(after.find((a) => a.id === "cube-rookie").earned);
  const earned = CQ.newlyEarned(CQ.blankStats(), s);
  assert.strictEqual(earned.length, 1);
  assert.strictEqual(earned[0].id, "cube-rookie");
});

/* 15. Persistence and recovery ------------------------------------ */
test("stats serialise and recover safely", () => {
  const s = CQ.blankStats();
  s.xp = 420; s.correct = 12; s.bestStreak = 7;
  const round = JSON.parse(JSON.stringify(s));
  assert.deepStrictEqual(round, s);
  assert.strictEqual(CQ.levelFromXp(round.xp).level, 3);
});

/* 16. Boundary cases ---------------------------------------------- */
test("boundaries: 0, 1, negatives, large cubes", () => {
  assert.strictEqual(CQ.integerCubeRoot(0), 0);
  assert.strictEqual(CQ.integerCubeRoot(1), 1);
  assert.strictEqual(CQ.integerCubeRoot(-1), -1);
  assert.strictEqual(CQ.integerCubeRoot(-8), -2);
  assert.strictEqual(CQ.integerCubeRoot(1000000), 100);
  assert.strictEqual(CQ.isPerfectCube(970299), true);   // 99³ = 970299
  assert.strictEqual(CQ.isPerfectCube(970300), false);
});
