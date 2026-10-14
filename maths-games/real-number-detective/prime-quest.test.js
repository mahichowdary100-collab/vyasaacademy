"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const PQ = require("./prime-quest.js");

const rng = PQ.seededRng;

/* ------------------------------------------------------------------ *
 * 1. INTEGER MATHEMATICS
 * ------------------------------------------------------------------ */
test("gcd / lcm are exact", () => {
  assert.equal(PQ.gcd(12, 18), 6);
  assert.equal(PQ.gcd(0, 5), 5);
  assert.equal(PQ.gcd(-12, 18), 6);
  assert.equal(PQ.lcm(4, 6), 12);
  assert.equal(PQ.lcm(3, 5), 15);
  assert.equal(PQ.lcm(0, 7), 0);
  assert.equal(PQ.gcdList([12, 18, 24]), 6);
  assert.equal(PQ.lcmList([12, 18, 24]), 72);
});

test("isPrime / isComposite recognise edge cases", () => {
  assert.equal(PQ.isPrime(1), false);
  assert.equal(PQ.isPrime(2), true);
  assert.equal(PQ.isPrime(97), true);
  assert.equal(PQ.isPrime(91), false); // 7 x 13
  assert.equal(PQ.isPrime(0), false);
  assert.equal(PQ.isPrime(-7), false);
  assert.equal(PQ.isComposite(1), false);
  assert.equal(PQ.isComposite(4), true);
  assert.equal(PQ.isComposite(2), false);
  assert.equal(PQ.isComposite(360), true);
});

test("primeFactors is exact and handles 1", () => {
  assert.deepEqual(PQ.primeFactors(1), []);
  assert.deepEqual(PQ.primeFactors(2), [2]);
  assert.deepEqual(PQ.primeFactors(360), [2, 2, 2, 3, 3, 5]);
  assert.deepEqual(PQ.primeFactors(97), [97]);
  assert.equal(PQ.primeFactors(0), null);
  assert.equal(PQ.primeFactors(-5), null);
  assert.equal(PQ.primeFactors(2.5), null);
});

test("factorMap / mapToFactorList / mapToNumber round-trip", () => {
  assert.deepEqual(PQ.factorMap(360), { 2: 3, 3: 2, 5: 1 });
  assert.deepEqual(PQ.factorMap(1), {});
  assert.equal(PQ.factorMap(0), null);
  assert.deepEqual(PQ.mapToFactorList({ 2: 3, 3: 2, 5: 1 }), [2, 2, 2, 3, 3, 5]);
  assert.equal(PQ.mapToNumber({ 2: 3, 3: 2, 5: 1 }), 360);
  assert.deepEqual(PQ.distinctPrimes(360), [2, 3, 5]);
  assert.deepEqual(PQ.distinctPrimes(97), [97]);
});

test("exponent forms are correct", () => {
  assert.equal(PQ.plainExponentForm(360), "2^3 \u00D7 3^2 \u00D7 5");
  assert.equal(PQ.prettyExponentForm(360), "2\u00B3 \u00D7 3\u00B2 \u00D7 5");
  assert.equal(PQ.plainExponentForm(12), "2^2 \u00D7 3");
  assert.equal(PQ.plainExponentForm(7), "7");
  assert.equal(PQ.plainExponentForm(1), "1");
});

test("divisorCount and properDivisors", () => {
  assert.equal(PQ.divisorCount(360), 24); // 4 * 3 * 2
  assert.equal(PQ.divisorCount(1), 1);
  assert.deepEqual(PQ.properDivisors(12), [2, 3, 4, 6]);
  assert.deepEqual(PQ.properDivisors(1), []);
});

test("perfect squares and integer roots are exact", () => {
  assert.equal(PQ.isPerfectSquare(16), true);
  assert.equal(PQ.isPerfectSquare(9), true);
  assert.equal(PQ.isPerfectSquare(15), false);
  assert.equal(PQ.isPerfectSquare(-4), false);
  assert.equal(PQ.integerSqrt(25), 5);
  assert.equal(PQ.integerSqrt(26), null);
  assert.equal(PQ.smallestFactor(360), 2);
  assert.equal(PQ.smallestFactor(97), 97);
  assert.equal(PQ.smallestFactor(49), 7);
});

test("factorTreeLines ends in primes and reconstructs n", () => {
  const lines = PQ.factorTreeLines(360);
  assert.ok(lines.every((l) => PQ.isPrime(l.value)));
  const product = lines.reduce((a, l) => a * l.value, 1);
  assert.equal(product, 360);
  assert.equal(lines.filter((l) => l.value === 2).length, 3);
});

/* ------------------------------------------------------------------ *
 * 2. FACTORISATION PARSING & VALIDATION
 * ------------------------------------------------------------------ */
test("parseFactorInput accepts many notations", () => {
  assert.deepEqual(PQ.parseFactorInput("2*2*2*3*3*5").factors, [2, 2, 2, 3, 3, 5]);
  assert.deepEqual(PQ.parseFactorInput("2\u00D72\u00D73").factors, [2, 2, 3]);
  assert.deepEqual(PQ.parseFactorInput("2 2 2 3 3 5").factors, [2, 2, 2, 3, 3, 5]);
  assert.deepEqual(PQ.parseFactorInput("2,2,2,3,3,5").factors, [2, 2, 2, 3, 3, 5]);
  assert.deepEqual(PQ.parseFactorInput("2^3 * 3^2 * 5").factors, [2, 2, 2, 3, 3, 5]);
  assert.deepEqual(PQ.parseFactorInput("2\u00B3 \u00D7 3\u00B2 \u00D7 5").factors, [2, 2, 2, 3, 3, 5]);
});

test("parseFactorInput rejects invalid input", () => {
  assert.equal(PQ.parseFactorInput("").ok, false);
  assert.equal(PQ.parseFactorInput("   ").ok, false);
  assert.equal(PQ.parseFactorInput(null).ok, false);
  assert.equal(PQ.parseFactorInput("abc").ok, false);
  assert.equal(PQ.parseFactorInput("1*5").ok, false); // 1 is not allowed
  assert.equal(PQ.parseFactorInput("2^0").ok, false);
});

test("checkFactorization accepts equivalent forms and rejects bad ones", () => {
  assert.equal(PQ.checkFactorization(360, "2*2*2*3*3*5").ok, true);
  assert.equal(PQ.checkFactorization(360, "3*5*2*2*2*3").ok, true); // reordered
  assert.equal(PQ.checkFactorization(360, "2^3 * 3^2 * 5").ok, true); // exponent form
  assert.equal(PQ.checkFactorization(360, "2\u00B3 \u00D7 3\u00B2 \u00D7 5").ok, true); // pretty
  assert.equal(PQ.checkFactorization(360, "4*2*45").ok, false); // composite factors
  assert.equal(PQ.checkFactorization(360, "2*2*2*3*3*5*5").ok, false); // wrong product
  assert.equal(PQ.checkFactorization(360, "2*2*2*3*3").ok, false); // incomplete
  assert.equal(PQ.checkFactorization(360, "360").ok, false); // not prime
  assert.equal(PQ.checkFactorization(1, "1").ok, false); // 1 not factorable
});

test("checkExponentForm mirrors checkFactorization", () => {
  assert.equal(PQ.checkExponentForm(360, "2^3 * 3^2 * 5").ok, true);
  assert.equal(PQ.checkExponentForm(360, "2^2 * 3^2 * 5").ok, false);
});

/* ------------------------------------------------------------------ *
 * 3. HCF AND LCM
 * ------------------------------------------------------------------ */
test("HCF/LCM by exponents agree with gcd/lcm", () => {
  assert.deepEqual(PQ.hcfByExponents(12, 18), { 2: 1, 3: 1 });
  assert.equal(PQ.mapToNumber(PQ.hcfByExponents(12, 18)), 6);
  assert.equal(PQ.mapToNumber(PQ.lcmByExponents(12, 18)), 36);
  assert.equal(PQ.exponentOf(360, 2), 3);
  assert.equal(PQ.exponentOf(360, 7), 0);
});

test("HCF x LCM = a x b for two numbers", () => {
  for (const [a, b] of [[36, 84], [210, 315], [8, 12], [300, 450]]) {
    assert.equal(PQ.gcd(a, b) * PQ.lcm(a, b), a * b);
  }
});

/* ------------------------------------------------------------------ *
 * 4. RATIONAL / IRRATIONAL AND DECIMALS
 * ------------------------------------------------------------------ */
test("reduceFraction normalises", () => {
  assert.deepEqual(PQ.reduceFraction(8, 12), { n: 2, d: 3 });
  assert.deepEqual(PQ.reduceFraction(6, -4), { n: -3, d: 2 });
  assert.equal(PQ.reduceFraction(3, 0), null);
});

test("classifyDecimalType uses the 2s-and-5s rule", () => {
  assert.equal(PQ.classifyDecimalType(7, 40).type, "terminating");
  assert.equal(PQ.classifyDecimalType(13, 125).type, "terminating");
  assert.equal(PQ.classifyDecimalType(3, 2).type, "terminating");
  assert.equal(PQ.classifyDecimalType(7, 12).type, "non-terminating-recurring");
  assert.equal(PQ.classifyDecimalType(11, 30).type, "non-terminating-recurring");
  // non-reduced input is reduced first: 6/12 = 1/2 -> terminating
  assert.equal(PQ.classifyDecimalType(6, 12).type, "terminating");
});

test("terminatingDecimalString is exact or null", () => {
  assert.equal(PQ.terminatingDecimalString(7, 40), "0.175");
  assert.equal(PQ.terminatingDecimalString(3, 2), "1.5");
  assert.equal(PQ.terminatingDecimalString(1, 8), "0.125");
  assert.equal(PQ.terminatingDecimalString(-1, 8), "-0.125");
  assert.equal(PQ.terminatingDecimalString(1, 3), null);
});

test("classifyNumber handles each exact descriptor kind", () => {
  assert.equal(PQ.classifyNumber({ kind: "int", value: 7, label: "7" }).value, "rational");
  assert.equal(PQ.classifyNumber({ kind: "fraction", n: 3, d: 4, label: "3/4" }).value, "rational");
  assert.equal(PQ.classifyNumber({ kind: "decimalTerm", label: "0.75" }).value, "rational");
  assert.equal(PQ.classifyNumber({ kind: "decimalRec", label: "0.333..." }).value, "rational");
  assert.equal(PQ.classifyNumber({ kind: "decimalIrr", label: "0.1010010001..." }).value, "irrational");
  assert.equal(PQ.classifyNumber({ kind: "sqrt", value: 4, label: "\u221A4" }).value, "rational");
  assert.equal(PQ.classifyNumber({ kind: "sqrt", value: 2, label: "\u221A2" }).value, "irrational");
  assert.equal(PQ.classifyNumber({ kind: "irrSqrt", label: "\u221A5" }).value, "irrational");
  assert.equal(PQ.classifyNumber({ kind: "sum", label: "2 + \u221A3" }).value, "irrational");
  assert.equal(PQ.classifyNumber({ kind: "product", label: "3\u221A2" }).value, "irrational");
  assert.equal(PQ.classifyNumber({ kind: "pi", label: "\u03C0" }).value, "irrational");
  assert.equal(PQ.classifyNumber({ kind: "ratioSqrts", n: 48, d: 27, label: "x" }).value, "rational");
  assert.equal(PQ.classifyNumber({ kind: "ratioSqrts", n: 12, d: 75, label: "x" }).value, "rational");
  assert.equal(PQ.classifyNumber(null).value, "unknown");
  assert.equal(PQ.classifyNumber({ kind: "nonsense" }).value, "unknown");
});

/* ------------------------------------------------------------------ *
 * 5. PROOF DATA
 * ------------------------------------------------------------------ */
test("proofData builds a complete contradiction argument", () => {
  for (const p of PQ.PROVABLE_PRIMES) {
    const d = PQ.proofData(p);
    assert.equal(d.prime, p);
    assert.ok(d.steps.length >= 6);
    assert.ok(/contradict/i.test(d.steps[d.steps.length - 2]));
    assert.ok(/irrational/.test(d.steps[d.steps.length - 1]));
    assert.ok(d.steps.some((s) => s.includes("HCF")));
  }
});

test("proofSteps returns a defensive copy", () => {
  const a = PQ.proofSteps(2);
  a.push("mutated");
  assert.equal(PQ.proofData(2).steps.length, a.length - 1);
});

/* ------------------------------------------------------------------ *
 * 6. QUESTION GENERATION
 * ------------------------------------------------------------------ */
test("every mode/difficulty produces well-formed questions", () => {
  const r = rng(2024);
  for (const diff of ["foundation", "application", "challenge"]) {
    for (const mode of ["factorization", "hcf-lcm", "rational", "decimal", "proof"]) {
      for (let i = 0; i < 30; i++) {
        const q = PQ.generateQuestion(mode, diff, r);
        assert.ok(q && q.prompt && q.explanation, mode + "/" + diff + " incomplete");
        assert.equal(q.mode, mode);
        assert.equal(q.difficulty, diff);
        assert.equal(q.topic, PQ.TOPICS[mode]);
        if (q.type === "mcq") {
          assert.ok(q.options.length >= 2 && q.options.length <= 4);
          assert.ok(q.answer >= 0 && q.answer < q.options.length);
          assert.equal(new Set(q.options).size, q.options.length, "duplicate MCQ option");
        } else if (q.type === "numeric") {
          assert.equal(typeof q.answer, "number");
        } else if (q.type === "order") {
          assert.ok(Array.isArray(q.answer) && q.answer.length > 1);
        } else if (q.type === "text") {
          assert.ok(Array.isArray(q.answer) && q.answer.every(PQ.isPrime));
        }
      }
    }
  }
});

test("factorization MCQs have exactly one correct option", () => {
  const r = rng(4242);
  for (let i = 0; i < 200; i++) {
    const q = PQ.genFactorization("application", r);
    if (q.type !== "mcq") continue;
    const target = Number(/factorisation of (\d+)/.exec(q.prompt)[1]);
    assert.equal(PQ.checkFactorization(target, q.options[q.answer]).ok, true);
    q.options.forEach((o, idx) => {
      if (idx !== q.answer) {
        assert.equal(PQ.checkFactorization(target, o).ok, false, "distractor is correct: " + o);
      }
    });
  }
});

test("rational MCQs agree with classifyNumber", () => {
  const r = rng(11);
  for (let i = 0; i < 120; i++) {
    const q = PQ.genRational("foundation", r);
    assert.ok(q.answer >= 0 && q.answer < q.options.length);
    const chosen = q.options[q.answer];
    // The correct option must be consistent with the question wording.
    if (/Which of the following is rational\?/.test(q.prompt)) {
      assert.ok(PQ.classifyNumber({ kind: "fraction", label: chosen }).value === "rational" ||
        chosen === "0.5" || chosen === "0.125" || chosen === "0.333..." || chosen === "\u221A16" || chosen === "7/9" || chosen === "22/7" || chosen === "3/4" || chosen === "\u22126");
    }
    if (/Which of the following is irrational\?/.test(q.prompt)) {
      assert.ok(["\u221A2", "\u221A3", "\u221A5", "\u221A7", "2 + \u221A3", "3\u221A2", "\u03C0", "0.1010010001..."].includes(chosen));
    }
  }
});

test("decimal MCQs agree with classifyDecimalType", () => {
  const r = rng(99);
  for (let i = 0; i < 120; i++) {
    const q = PQ.genDecimal("application", r);
    if (/expansion of (\d+)\/(\d+)/.test(q.prompt)) {
      const m = /expansion of (\d+)\/(\d+)/.exec(q.prompt);
      const info = PQ.classifyDecimalType(Number(m[1]), Number(m[2]));
      const expected = info.type === "terminating" ? 0 : 1;
      assert.equal(q.answer, expected);
    } else if (/TERMINATING/.test(q.prompt)) {
      const chosen = q.options[q.answer];
      const m = /(\d+)\/(\d+)/.exec(chosen);
      assert.equal(PQ.classifyDecimalType(Number(m[1]), Number(m[2])).type, "terminating");
    }
  }
});

test("proof order questions carry a valid identity answer", () => {
  const r = rng(7);
  let seenOrder = 0;
  for (let i = 0; i < 200; i++) {
    const q = PQ.genProof("challenge", r);
    assert.ok(q.answer !== -1);
    if (q.type === "order") {
      seenOrder++;
      const n = q.data.canonical.length;
      assert.deepEqual(q.answer, Array.from({ length: n }, (_, k) => k));
      assert.equal(q.data.shown.length, n);
    }
  }
  assert.ok(seenOrder > 0, "expected at least one order question");
});

/* ------------------------------------------------------------------ *
 * 7. ANSWER CHECKING
 * ------------------------------------------------------------------ */
test("checkAnswer grades MCQs", () => {
  const q = { type: "mcq", options: ["a", "b", "c", "d"], answer: 2 };
  assert.equal(PQ.checkAnswer(q, 2).correct, true);
  assert.equal(PQ.checkAnswer(q, 0).correct, false);
  assert.equal(PQ.checkAnswer(q, "2").correct, true);
  assert.equal(PQ.checkAnswer(q, "").ok, false);
  assert.equal(PQ.checkAnswer(q, 9).ok, false);
});

test("checkAnswer grades numeric answers with tolerance", () => {
  const q = { type: "numeric", answer: 36 };
  assert.equal(PQ.checkAnswer(q, "36").correct, true);
  assert.equal(PQ.checkAnswer(q, " 36 ").correct, true);
  assert.equal(PQ.checkAnswer(q, "35").correct, false);
  assert.equal(PQ.checkAnswer(q, "").ok, false);
  assert.equal(PQ.checkAnswer(q, "abc").ok, false);
  const neg = { type: "numeric", answer: -6 };
  assert.equal(PQ.checkAnswer(neg, "\u22126").correct, true);
});

test("checkAnswer grades text factorisations against the target", () => {
  const q = { type: "text", mode: "factorization", answer: [2, 2, 3], data: { target: 12 } };
  assert.equal(PQ.checkAnswer(q, "2*2*3").correct, true);
  assert.equal(PQ.checkAnswer(q, "3*2*2").correct, true);
  assert.equal(PQ.checkAnswer(q, "2^2*3").correct, true);
  assert.equal(PQ.checkAnswer(q, "2*2*2").correct, false);
  assert.equal(PQ.checkAnswer(q, "4*3").correct, false);
});

test("checkAnswer grades order questions", () => {
  const q = { type: "order", answer: [0, 1, 2, 3] };
  assert.equal(PQ.checkAnswer(q, [0, 1, 2, 3]).correct, true);
  assert.equal(PQ.checkAnswer(q, [3, 2, 1, 0]).correct, false);
  assert.equal(PQ.checkAnswer(q, [0, 1, 2]).correct, false);
  assert.equal(PQ.checkAnswer(q, null).ok, false);
});

test("parseNumber handles integers, decimals and rejects junk", () => {
  assert.equal(PQ.parseNumber("42"), 42);
  assert.equal(PQ.parseNumber("3.5"), 3.5);
  assert.equal(PQ.parseNumber("\u22126"), -6);
  assert.equal(PQ.parseNumber("1,000"), 1000);
  assert.equal(PQ.parseNumber("abc"), null);
  assert.equal(PQ.parseNumber(""), null);
});

/* ------------------------------------------------------------------ *
 * 8. SCORING, LEVELS, ACHIEVEMENTS, STATS
 * ------------------------------------------------------------------ */
test("scoreAnswer never rewards wrong answers and adds bonuses", () => {
  assert.equal(PQ.scoreAnswer(false, 15, 0.5, 3), 0);
  assert.equal(PQ.scoreAnswer(true, 10, 0, 0), 10);
  assert.equal(PQ.scoreAnswer(true, 10, 1, 0), 10 + 5);
  assert.equal(PQ.scoreAnswer(true, 10, 0, 5), 10 + 10);
  assert.ok(PQ.scoreAnswer(true, 30, 0.5, 1) > PQ.scoreAnswer(true, 15, 0.5, 1));
});

test("levelFromXp maps thresholds to levels", () => {
  assert.equal(PQ.levelFromXp(0).level, 1);
  assert.equal(PQ.levelFromXp(-5).level, 1);
  assert.equal(PQ.levelFromXp(PQ.LEVEL_THRESHOLDS[1]).level, 2);
  assert.ok(PQ.levelFromXp(3750).level >= 11);
  assert.ok(PQ.levelFromXp(200).pct >= 0 && PQ.levelFromXp(200).pct <= 100);
});

test("blankStats is complete and serialisable", () => {
  const s = PQ.blankStats();
  assert.equal(s.xp, 0);
  assert.equal(s.answered, 0);
  assert.deepEqual(s.topicCorrect, {});
  assert.deepEqual(s.history, []);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
});

test("achievementStatus marks earned achievements safely", () => {
  const s = PQ.blankStats();
  s.answered = 1;
  const earned = PQ.achievementStatus(s).filter((a) => a.earned).map((a) => a.id);
  assert.ok(earned.includes("first_factor"));
  assert.equal(PQ.achievementStatus(s).length, PQ.ACHIEVEMENTS.length);
  // never throws on a sparse object
  assert.doesNotThrow(() => PQ.achievementStatus({ topicCorrect: {} }));
});

test("sanitizeStats coerces, bounds and never throws", () => {
  assert.equal(PQ.sanitizeStats(null).answered, 0);
  assert.equal(PQ.sanitizeStats("garbage").answered, 0);
  const s = PQ.sanitizeStats({ answered: 3, correct: 99, xp: -10, bestAccuracy: 250, topicCorrect: { factorization: 5, "bad key": 3 } });
  assert.equal(s.answered, 3);
  assert.equal(s.correct, 3); // clamped to answered
  assert.equal(s.xp, 0); // negatives dropped
  assert.equal(s.bestAccuracy, 100);
  assert.equal(s.topicCorrect.factorization, 5);
  assert.equal(s.topicCorrect["bad key"], undefined);
  // surviving a full storage round-trip is lossless
  const clean = PQ.blankStats();
  clean.xp = 500;
  clean.answered = 12;
  clean.correct = 10;
  clean.topicCorrect = { proof: 4 };
  clean.modesCompleted = { proof: true };
  assert.deepEqual(PQ.sanitizeStats(JSON.parse(JSON.stringify(clean))), clean);
});

/* ------------------------------------------------------------------ *
 * 9. BLITZ
 * ------------------------------------------------------------------ */
test("makeBlitz returns the requested count of unique questions", () => {
  const b = PQ.makeBlitz(15, "application", rng(9), {});
  assert.equal(b.length, 15);
  const prompts = new Set(b.map((q) => q.mode + ":" + q.prompt));
  assert.equal(prompts.size, b.length);
  b.forEach((q) => assert.ok(q.prompt && q.explanation));
});

test("makeBlitz supports a mixed-difficulty pool", () => {
  const b = PQ.makeBlitz(20, null, rng(5), { mix: true });
  assert.equal(b.length, 20);
});

/* ------------------------------------------------------------------ *
 * 10. FACTOR TREE HELPERS
 * ------------------------------------------------------------------ */
test("tree helpers build, split and measure trees", () => {
  const t = PQ.makeNode(360);
  assert.equal(t.prime, false);
  assert.equal(PQ.treeProduct(t), 360);
  assert.equal(PQ.treeComplete(t), false);
  assert.deepEqual(PQ.treeLeaves(t), [360]);

  const leaf = PQ.makeNode(7);
  assert.equal(leaf.prime, true);
  assert.equal(PQ.treeComplete(leaf), true);
  assert.equal(PQ.treeProduct(leaf), 7);
});

/* ------------------------------------------------------------------ *
 * 11. INTERNAL SELF-CHECK
 * ------------------------------------------------------------------ */
test("engine self-check passes", () => {
  const result = PQ.validate();
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.equal(PQ.selfCheck().ok, true);
});
