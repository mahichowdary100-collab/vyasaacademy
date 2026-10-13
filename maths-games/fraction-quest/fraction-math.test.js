"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const FM = require("./fraction-math.js");

const rng = FM.seededRng;
const frac = FM.frac;
const render = FM.render;
const renderMixed = FM.renderMixed;

/* ------------------------------------------------------------------ *
 * 1. CORE EXACT ARITHMETIC
 * ------------------------------------------------------------------ */
test("frac normalises sign and reduces", () => {
  assert.deepEqual(frac(2, 4), { n: 1, d: 2 });
  assert.deepEqual(frac(0, 7), { n: 0, d: 1 });
  assert.deepEqual(frac(2, -4), { n: -1, d: 2 });
  assert.deepEqual(frac(-2, -4), { n: 1, d: 2 });
});

test("frac rejects zero denominator", () => {
  assert.throws(() => frac(1, 0));
  assert.throws(() => frac(3, -0));
});

test("division by zero fraction throws", () => {
  assert.throws(() => FM.div(frac(1, 2), frac(0, 3)));
});

test("gcd and lcm", () => {
  assert.equal(FM.gcd(12, 18), 6);
  assert.equal(FM.gcd(0, 5), 5);
  assert.equal(FM.lcm(4, 6), 12);
  assert.equal(FM.lcm(3, 5), 15);
});

test("exact add/sub/mul/div", () => {
  assert.deepEqual(FM.add(frac(1, 2), frac(1, 3)), { n: 5, d: 6 });
  assert.deepEqual(FM.sub(frac(3, 4), frac(1, 4)), { n: 1, d: 2 });
  assert.deepEqual(FM.mul(frac(2, 3), frac(3, 5)), { n: 2, d: 5 });
  assert.deepEqual(FM.div(frac(4, 5), frac(2, 3)), { n: 6, d: 5 });
  assert.deepEqual(FM.sub(frac(1, 4), frac(3, 4)), { n: -1, d: 2 });
});

test("exact equality and comparison (cross-multiplication)", () => {
  assert.equal(FM.eq(frac(2, 4), frac(1, 2)), true);
  assert.equal(FM.eq(frac(3, 5), frac(2, 3)), false);
  assert.equal(FM.cmp(frac(5, 8), frac(3, 5)), 1);
  assert.equal(FM.cmp(frac(1, 3), frac(1, 2)), -1);
  assert.equal(FM.compareSymbol(frac(1, 3), frac(1, 3)), "=");
});

test("mixed-number conversion and display", () => {
  assert.deepEqual(FM.toMixed(frac(7, 4)), { whole: 1, n: 3, d: 4, neg: false });
  assert.equal(renderMixed(frac(7, 4)), "1 3/4");
  assert.equal(renderMixed(frac(-7, 4)), "-1 3/4");
  assert.equal(renderMixed(frac(4, 2)), "2");
  assert.equal(renderMixed(frac(3, 4)), "3/4");
  assert.equal(FM.render(frac(7, 4)), "7/4");
  assert.deepEqual(FM.fromMixed(1, 3, 4), { n: 7, d: 4 });
  assert.deepEqual(FM.fromMixed(-1, 3, 4), { n: -7, d: 4 });
  assert.equal(FM.fromMixed(1, 5, 4), null);
  assert.equal(FM.fromMixed(1, 3, 0), null);
});

test("terminating decimals and decimal strings are exact", () => {
  assert.equal(FM.isTerminating(frac(1, 4)), true);
  assert.equal(FM.isTerminating(frac(1, 3)), false);
  assert.equal(FM.toDecimalString(frac(1, 4)), "0.25");
  assert.equal(FM.toDecimalString(frac(3, 2)), "1.5");
  assert.equal(FM.toDecimalString(frac(-1, 8)), "-0.125");
  assert.equal(FM.toDecimalString(frac(1, 3)), null);
});

test("percent strings are exact or null", () => {
  assert.equal(FM.toPercentString(frac(3, 4)), "75%");
  assert.equal(FM.toPercentString(frac(1, 2)), "50%");
  assert.equal(FM.toPercentString(frac(1, 3)), null);
  assert.equal(FM.toPercentString(frac(1, 25)), "4%");
});

/* ------------------------------------------------------------------ *
 * 2. INPUT PARSING
 * ------------------------------------------------------------------ */
test("parseInput accepts all documented forms", () => {
  const cases = [
    ["3/4", { n: 3, d: 4 }],
    ["-2/3", { n: -2, d: 3 }],
    ["2", { n: 2, d: 1 }],
    ["0", { n: 0, d: 1 }],
    ["1 3/4", { n: 7, d: 4 }],
    ["-1 3/4", { n: -7, d: 4 }],
    ["0.75", { n: 3, d: 4 }],
    [".75", { n: 3, d: 4 }],
    ["75%", { n: 3, d: 4 }],
    ["-12.5%", { n: -1, d: 8 }],
    ["1/2", { n: 1, d: 2 }],
    ["9/4", { n: 9, d: 4 }]
  ];
  for (const [input, want] of cases) {
    const p = FM.parseInput(input);
    assert.equal(p.ok, true, `expected ${input} to parse`);
    assert.deepEqual(p.value, want, `value for ${input}`);
  }
});

test("parseInput rejects invalid and zero denominators", () => {
  for (const input of ["", "abc", "1/0", "3/0", "//", "1 5/4", "1/4/", "..", "-"]) {
    const p = FM.parseInput(input);
    assert.equal(p.ok, false, `expected ${JSON.stringify(input)} to be rejected`);
  }
  assert.equal(FM.parseInput(null).ok, false);
  assert.equal(FM.parseInput("2 / 3").ok, true);
});

test("fraction/percent/decimal inputs are normalised by checkAnswer", () => {
  const q = { type: "numeric", canonical: { n: 1, d: 2 }, reducedRequired: false };
  for (const ans of ["2/4", "0.5", "50%", "1/2"]) {
    assert.equal(FM.checkAnswer(q, ans), true, `expected ${ans} correct`);
  }
  for (const ans of ["3/4", "0.4", "51%", "abc"]) {
    assert.equal(FM.checkAnswer(q, ans), false, `expected ${ans} incorrect`);
  }
});

test("when reducedRequired, only the reduced form passes", () => {
  const q = { type: "numeric", canonical: { n: 1, d: 2 }, reducedRequired: true };
  assert.equal(FM.checkAnswer(q, "1/2"), true);
  assert.equal(FM.checkAnswer(q, "2/4"), false);
});

test("checkAnswer handles MCQ indices and option strings", () => {
  const q = { type: "mcq", options: ["a", "b", "c"], answer: 1 };
  assert.equal(FM.checkAnswer(q, 1), true);
  assert.equal(FM.checkAnswer(q, "b"), true);
  assert.equal(FM.checkAnswer(q, 0), false);
  assert.equal(FM.checkAnswer(q, "a"), false);
});

test("normaliseAnswer returns parseable values for each type", () => {
  const mq = { type: "mcq", options: ["<", ">", "="], answer: 2 };
  assert.deepEqual(FM.normaliseAnswer(mq, 2), { ok: true, value: 2 });
  assert.deepEqual(FM.normaliseAnswer(mq, "="), { ok: true, value: 2 });
  assert.equal(FM.normaliseAnswer(mq, "NOPE").ok, false);
  const nq = { type: "numeric", canonical: { n: 3, d: 4 } };
  assert.deepEqual(FM.normaliseAnswer(nq, "0.75").value, { n: 3, d: 4 });
  assert.equal(FM.normaliseAnswer(nq, "x").ok, false);
});

/* ------------------------------------------------------------------ *
 * 3. PROFILES
 * ------------------------------------------------------------------ */
test("four profiles with the required class bands and ranges", () => {
  assert.equal(FM.PROFILES.length, 4);
  const ids = FM.PROFILES.map((p) => p.id);
  assert.deepEqual(ids, ["foundation", "intermediate", "advanced", "challenge"]);
  const bands = FM.PROFILES.map((p) => p.classes);
  assert.deepEqual(bands, ["Class 6-7", "Class 7-8", "Class 8-9", "Class 9-10"]);
  assert.equal(FM.PROFILES[0].maxDen, 8);
  assert.equal(FM.PROFILES[0].allowNeg, false);
  assert.equal(FM.PROFILES[1].maxDen, 12);
  assert.equal(FM.PROFILES[2].maxDen, 15);
  assert.equal(FM.PROFILES[2].allowNeg, true);
  assert.equal(FM.PROFILES[3].maxDen, 20);
  assert.equal(FM.profileMeta("nope").id, "foundation");
});

/* ------------------------------------------------------------------ *
 * 4. QUESTION GENERATION
 * ------------------------------------------------------------------ */
test("generated questions are valid across every profile and kind", () => {
  for (const profile of FM.PROFILES) {
    for (const kind of profile.kinds) {
      for (let s = 0; s < 40; s++) {
        const q = FM.generateQuestion({ profile: profile.id, kind, rng: rng(s + 1) });
        assert.ok(q, `${profile.id}/${kind}`);
        assert.equal(q.profile, profile.id);
        assert.equal(q.kind, kind);
        assert.equal(typeof q.prompt, "string");
        assert.ok(q.prompt.length > 4);
        assert.equal(typeof q.hint, "string");
        assert.equal(typeof q.explanation, "string");
        assert.equal(q.marks, profile.marks);
        if (q.type === "mcq") {
          assert.ok(q.options.length >= 3, `${profile.id}/${kind} opts`);
          const counts = {};
          for (const o of q.options) counts[o] = (counts[o] || 0) + 1;
          const uniq = Object.keys(counts).length;
          assert.equal(uniq, q.options.length, "options unique");
          assert.ok(q.answer >= 0 && q.answer < q.options.length, "answer index");
        } else if (q.type === "numeric") {
          assert.ok(q.canonical && typeof q.canonical.n === "number" && q.canonical.d > 0, "canonical");
        }
      }
    }
  }
});

test("foundation questions stay non-negative", () => {
  for (let s = 0; s < 120; s++) {
    for (const kind of ["add", "sub", "equiv", "missing"]) {
      const q = FM.generateQuestion({ profile: "foundation", kind, rng: rng(s + 7) });
      if (q.type === "numeric" && (q.canonical.n < 0 || q.canonical.d < 0)) {
        assert.fail(`negative canonical ${kind}: ${q.canonical.n}/${q.canonical.d}`);
      }
    }
  }
});

test("every generated MCQ has a provably correct answer and valid distractors", () => {
  for (const profile of FM.PROFILES) {
    for (const kind of profile.kinds) {
      for (let s = 0; s < 40; s++) {
        const q = FM.generateQuestion({ profile: profile.id, kind, rng: rng(900 + s) });
        if (q.type !== "mcq") continue;
        assert.equal(FM.checkAnswer(q, q.answer), true, `${profile.id}/${kind} q itself`);
        // answer option text also matches
        assert.equal(FM.checkAnswer(q, q.options[q.answer]), true, `${profile.id}/${kind} option`);
        // every marked-wrong option is genuinely wrong
        for (let i = 0; i < q.options.length; i++) {
          if (i !== q.answer) {
            assert.equal(FM.checkAnswer(q, i), false, `${profile.id}/${kind} distractor ${i}`);
          }
        }
      }
    }
  }
});

test("simplify questions display an unreduced fraction and the reduced answer", () => {
  for (let s = 0; s < 60; s++) {
    const q = FM.generateQuestion({ profile: "foundation", kind: "simplify", rng: rng(s) });
    assert.equal(q.type, "mcq");
    const shown = q.prompt.match(/Write ([\d\-/ ]+) in simplest/);
    assert.ok(shown, "prompt shape");
    const displayed = shown[1];
    assert.ok(displayed.includes("/"), "unreduced display has a slash");
    const v = FM.parseInput(displayed);
    assert.equal(v.ok, true);
    assert.notEqual(FM.render(v.value), displayed, `displayed ${displayed} must be unreduced`);
    const correct = FM.parseInput(q.options[q.answer]);
    assert.equal(correct.ok, true);
    assert.equal(FM.render(correct.value), q.options[q.answer], "answer is reduced");
    assert.equal(FM.eq(v.value, correct.value), true, "displayed equals answer value");
  }
});

test("equiv/missing questions scale by an integer factor and always have a correct lock", () => {
  for (let s = 0; s < 60; s++) {
    const q = FM.generateQuestion({ profile: "foundation", kind: "equiv", rng: rng(s) });
    assert.equal(q.type, "numeric");
    const lhs = q.prompt.match(/^What number makes the fractions equivalent\? ([\d\-]+)\/[\d\-]+/);
    assert.ok(lhs, "left fraction present");
    const base = FM.parseInput(q.prompt.match(/([\d\-]+\/[\d\-]+)\s*=/)[1]);
    const mDen = q.prompt.match(/= (\d+)\/\?/);
    const mNum = q.prompt.match(/= \?\/(\d+)/);
    assert.ok(mDen || mNum, "a lock form is present");
    if (mDen) {
      assert.equal(FM.eq(base.value, { n: Number(mDen[1]), d: q.canonical.n }), true, "scaled pair is equivalent");
    } else {
      assert.equal(FM.eq(base.value, { n: q.canonical.n, d: Number(mNum[1]) }), true, "scaled pair is equivalent");
    }
  }
});

test("word division always yields an integer piece count", () => {
  for (let s = 0; s < 120; s++) {
    const q = FM.generateQuestion({ profile: "challenge", kind: "word", rng: rng(s) });
    if (/m long is cut into pieces/.test(q.prompt)) {
      assert.equal(q.canonical.d, 1, "pieces must be whole: " + q.prompt);
    }
  }
});

/* ------------------------------------------------------------------ *
 * 5. BUILDER MODE
 * ------------------------------------------------------------------ */
test("builder challenges are internally consistent", () => {
  for (const profile of ["foundation", "intermediate", "advanced", "challenge"]) {
    for (let s = 0; s < 60; s++) {
      const c = FM.builderChallenge(profile, rng(50 + s));
      assert.ok(c.kind && c.prompt && c.explanation, "spec complete");
      if (c.options) {
        assert.equal(c.answer >= 0 && c.answer < c.options.length, true);
        assert.equal(FM.checkAnswer({ type: "mcq", options: c.options, answer: c.answer }, c.answer), true);
      }
      if (c.type === "numeric") {
        assert.equal(typeof c.canonical.n, "number");
        assert.ok(c.canonical.d > 0);
      }
      if (c.kind === "construct") {
        assert.ok(c.target.n > 0 && c.target.d > 1);
        assert.equal(c.answerCount, c.target.n);
      }
      if (c.kind === "compare") {
        assert.equal(c.options.includes("<") && c.options.includes(">"), true);
      }
    }
  }
});

/* ------------------------------------------------------------------ *
 * 6. ESCAPE ROOM
 * ------------------------------------------------------------------ */
test("all five rooms are solvable with integer locks and the correct door code", () => {
  assert.equal(FM.validateEscapeRooms(), true);
  for (let room = 1; room <= 5; room++) {
    for (let s = 0; s < 30; s++) {
      const data = FM.escapeRoomPuzzles(room, rng(s * 3));
      assert.equal(data.locks.length, 3);
      const sum = data.locks.reduce((acc, l) => acc + l.answer, 0);
      assert.equal(data.door.answer, sum, `room ${room} door code`);
      for (const lock of data.locks) {
        assert.ok(Number.isInteger(lock.answer), `room ${room} integer lock`);
        assert.ok(lock.answer >= 0, `room ${room} non-negative`);
      }
    }
  }
});

/* ------------------------------------------------------------------ *
 * 7. MATCH ARENA
 * ------------------------------------------------------------------ */
test("match pairs are valid, unique and distractor-free for every type", () => {
  for (const type of FM.MATCH_TYPES.map((t) => t.id)) {
    for (let s = 0; s < 30; s++) {
      const pairs = FM.matchPairs(type, 4, rng(s + 11));
      assert.equal(pairs.length, 4, `${type} count`);
      const leftKeys = new Set();
      const rightKeys = new Set();
      for (const p of pairs) {
        assert.ok(!leftKeys.has(p.left.key) && !rightKeys.has(p.right.key), "no duplicate edges");
        leftKeys.add(p.left.key);
        rightKeys.add(p.right.key);
        if (type !== "model") {
          assert.ok(p.left.key !== p.right.key, "edge endpoints differ");
        }
      }
      if (type === "equiv") {
        for (const p of pairs) {
          const l = FM.parseInput(p.left.text);
          const r = FM.parseInput(p.right.text);
          assert.equal(l.ok && r.ok, true);
          assert.equal(FM.eq(l.value, r.value), true);
          assert.notEqual(FM.render(r.value), p.right.text, "scaled side must be shown unreduced");
          assert.equal(FM.render(l.value), p.left.text, "base side shown in simplest form");
        }
      }
      if (type === "simplest") {
        for (const p of pairs) {
          const l = FM.parseInput(p.left.text);
          const r = FM.parseInput(p.right.text);
          assert.equal(FM.eq(l.value, r.value), true);
          assert.notEqual(FM.render(l.value), p.left.text, "left shown unreduced");
          assert.equal(FM.render(r.value), p.right.text, "right shown in simplest form");
        }
      }
      if (type === "decimal") {
        for (const p of pairs) {
          const l = FM.parseInput(p.left.text);
          assert.equal(FM.isTerminating(l.value), true);
          assert.equal(FM.toDecimalString(l.value), p.right.text);
        }
      }
      if (type === "percent") {
        for (const p of pairs) {
          const l = FM.parseInput(p.left.text);
          assert.equal(FM.toPercentString(l.value), p.right.text);
        }
      }
      if (type === "mixed") {
        for (const p of pairs) {
          const l = FM.parseInput(p.left.text);
          assert.equal(FM.toMixed(l.value).neg === false ? FM.renderMixed(l.value) : FM.renderMixed(l.value), p.right.text);
        }
      }
    }
  }
});

/* ------------------------------------------------------------------ *
 * 8. BOTS
 * ------------------------------------------------------------------ */
test("bots exist, are deterministic and resolve inside the answer window", () => {
  assert.equal(FM.BOTS.map((b) => b.profile).join(), "foundation,intermediate,advanced,challenge");
  for (const bot of FM.BOTS) {
    const q = FM.generateQuestion({ profile: bot.profile, rng: rng(3) });
    const a = FM.botResolve(q, bot, rng(99));
    const b = FM.botResolve(q, bot, rng(99));
    assert.deepEqual(a, b, `deterministic ${bot.id}`);
    assert.ok(a.ms > 0 && a.ms < 20000);
    assert.equal(typeof a.correct, "boolean");
  }
});

/* ------------------------------------------------------------------ *
 * 9. SCORING, XP, ACHIEVEMENTS
 * ------------------------------------------------------------------ */
test("scoreAnswer rewards correctness and never pays wrong answers", () => {
  assert.equal(FM.scoreAnswer(false, 15, 0.5, 1), 0);
  assert.equal(FM.scoreAnswer(true, 15, 1, 1), 15);
  assert.equal(FM.scoreAnswer(true, 15, 0, 1), 15 + Math.round(15 * 0.4));
  assert.ok(FM.scoreAnswer(true, 30, 0.5, 3) > FM.scoreAnswer(true, 15, 0.5, 3));
});

test("levels are monotonic and XP bands are consistent", () => {
  assert.equal(FM.levelFromXp(0).level, 1);
  assert.equal(FM.levelFromXp(99).level, 1);
  assert.equal(FM.levelFromXp(100).level, 2);
  assert.equal(FM.levelFromXp(400).level, 3);
  const a = FM.levelFromXp(250);
  assert.equal(a.into + a.span * (a.level - 1) >= 0, true);
  assert.ok(a.pct >= 0 && a.pct <= 100);
  assert.equal(FM.levelFromXp(10 ** 9).level, 60);
});

test("the ten achievements gate on the right stats", () => {
  const s = FM.blankStats();
  assert.equal(FM.achievementStatus(s).filter((a) => a.earned).length, 0);
  s.correct = 1;
  assert.equal(FM.achievementStatus(s).find((a) => a.id === "first-victory").earned, true);
  s.xp = 250;
  assert.equal(FM.achievementStatus(s).find((a) => a.id === "explorer").earned, true);
  s.topicCorrect = { equiv: 10, simplify: 2 };
  assert.equal(FM.achievementStatus(s).find((a) => a.id === "equiv-expert").earned, true);
  assert.equal(FM.achievementStatus(s).find((a) => a.id === "simplify-master").earned, false);
  s.roomsEscape = 5;
  assert.equal(FM.achievementStatus(s).find((a) => a.id === "escape-artist").earned, true);
  s.botsBeaten = 1;
  assert.ok(FM.achievementStatus(s).find((a) => a.id === "bot-slayer").earned);
  s.bossBeaten = true;
  assert.ok(FM.achievementStatus(s).find((a) => a.id === "boss-slayer").earned);
  s.blitzBest = 240;
  assert.ok(FM.achievementStatus(s).find((a) => a.id === "blitz-champion").earned);
  s.matchPerfect = 1;
  assert.ok(FM.achievementStatus(s).find((a) => a.id === "perfect-match").earned);
  s.bestAccuracy = 0.95;
  s.bestAccuracyN = 14;
  assert.ok(FM.achievementStatus(s).find((a) => a.id === "accuracy-ace").earned);
  assert.equal(FM.newlyEarned(FM.blankStats(), s).length, 9); // simplify-master correctly still locked
});

test("blankStats is write-safe and serialisable for localStorage", () => {
  const s = FM.blankStats();
  const clone = JSON.parse(JSON.stringify(s));
  assert.deepEqual(clone, s);
  assert.equal(clone.topicCorrect instanceof Object, true);
});