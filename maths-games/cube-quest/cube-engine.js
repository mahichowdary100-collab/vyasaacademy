/* =====================================================================
 * CUBE QUEST - Cubes & Cube Roots : mathematical question engine
 * ---------------------------------------------------------------------
 * Pure, dependency-free, testable module. Loads in the browser as a
 * global (window.CubeQuestEngine) and in Node via require() so it can be
 * unit tested with the built-in test runner (node --test).
 *
 * Design notes
 *  - All cube / cube-root arithmetic is done with INTEGER operations only
 *    (binary search on mid*mid*mid) so exact perfect-cube validation never
 *    suffers floating-point error. A rounded cube root is never accepted.
 *  - "Domain rules" (what is mathematically true for any integer) are kept
 *    separate from the "difficulty range" (which numbers the generator is
 *    allowed to use). This is deliberate: the maths is unbounded, the game
 *    numbers are bounded.
 *  - Randomness is injected as an rng() function so results are
 *    reproducible when a seeded generator is supplied (used by tests).
 * ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CubeQuestEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var CQ = {};

  /* ------------------------------------------------------------------
   * 1. INTEGER-SAFE NUMBER THEORY
   * ---------------------------------------------------------------- */

  // n squared / cubed, integer only.
  function square(n) { return n * n; }
  function cube(n) { return n * n * n; }

  // Exact integer cube root, or null when n is not a perfect cube.
  // Works for negatives (cube root of -27 is -3). Integer arithmetic only.
  function integerCubeRoot(n) {
    if (typeof n !== "number" || !Number.isInteger(n)) { return null; }
    var neg = n < 0;
    var m = Math.abs(n);
    if (m === 0) { return 0; }
    var lo = 0;
    var hi = 1;
    // Grow hi until hi^3 >= m (avoids Math.cbrt / pow inaccuracies).
    while (cube(hi) < m) { hi *= 2; }
    while (lo <= hi) {
      var mid = Math.floor((lo + hi) / 2);
      var c = cube(mid);
      if (c === m) { return neg ? -mid : mid; }
      if (c < m) { lo = mid + 1; } else { hi = mid - 1; }
    }
    return null;
  }

  function isPerfectCube(n) { return integerCubeRoot(n) !== null; }

  // Prime factorisation -> { prime: exponent }, e.g. 216 -> {2:3, 3:3}.
  function factorize(n) {
    var out = {};
    if (typeof n !== "number" || !Number.isInteger(n) || n < 1) { return out; }
    var m = n;
    var d = 2;
    while (d * d <= m) {
      while (m % d === 0) { out[d] = (out[d] || 0) + 1; m /= d; }
      d += (d === 2) ? 1 : 2;
    }
    if (m > 1) { out[m] = (out[m] || 0) + 1; }
    return out;
  }

  // A number is a perfect cube iff every prime exponent is divisible by 3.
  function isPerfectCubeByFactors(n) {
    if (!Number.isInteger(n) || n < 1) { return false; }
    if (n === 1) { return true; } // 1 = 1^3
    var f = factorize(n);
    var keys = Object.keys(f);
    for (var i = 0; i < keys.length; i++) {
      if (f[keys[i]] % 3 !== 0) { return false; }
    }
    return keys.length > 0;
  }

  // Smallest positive integer to multiply n by so the product is a cube.
  // Returns 1 when n is already a perfect cube.
  function minMultiplierToCube(n) {
    if (!Number.isInteger(n) || n < 1) { return null; }
    var f = factorize(n);
    var mult = 1;
    Object.keys(f).forEach(function (p) {
      var e = f[p];
      var need = (3 - (e % 3)) % 3;
      if (need > 0) { mult *= Math.pow(Number(p), need); }
    });
    return mult;
  }

  // Smallest positive integer to divide n by so the quotient is a cube.
  // Returns 1 when n is already a perfect cube.
  function minDivisorToCube(n) {
    if (!Number.isInteger(n) || n < 1) { return null; }
    var f = factorize(n);
    var div = 1;
    Object.keys(f).forEach(function (p) {
      var e = f[p];
      var extra = e % 3;
      if (extra > 0) { div *= Math.pow(Number(p), extra); }
    });
    return div;
  }

  var SUP = { "0": "\u2070", "1": "\u00b9", "2": "\u00b2", "3": "\u00b3", "4": "\u2074", "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079" };
  function superscript(n) {
    return String(n).split("").map(function (ch) { return SUP[ch] || ch; }).join("");
  }

  // "2³ x 3³" style string for a factorisation map.
  function formatFactorisation(n) {
    var f = factorize(n);
    var keys = Object.keys(f).sort(function (a, b) { return Number(a) - Number(b); });
    if (!keys.length) { return "1"; }
    return keys.map(function (p) {
      return p + (f[p] > 1 ? superscript(f[p]) : "");
    }).join(" \u00d7 ");
  }

  // The perfect cubes immediately below and above n (inclusive when exact).
  function nearestCubes(n) {
    if (!Number.isInteger(n) || n < 0) { return null; }
    var k = Math.max(0, Math.floor(guessCubeRoot(n)));
    while (cube(k) > n) { k--; }
    while (cube(k + 1) <= n) { k++; }
    return { lower: cube(k), lowerRoot: k, upper: cube(k + 1), upperRoot: k + 1, exact: cube(k) === n };
  }

  // Approximate cube root (bounded loop; only used to seed search windows).
  function guessCubeRoot(n) {
    if (n < 1) { return 0; }
    var r = 1;
    while (cube(r) < n) { r *= 2; if (r > 1e6) { break; } }
    return r;
  }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }

  /* ------------------------------------------------------------------
   * 2. SEEDED RNG (mulberry32) + helpers
   * ---------------------------------------------------------------- */
  function seededRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function ri(a, b, rng) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function uniqNums(arr) {
    var seen = {}; var out = [];
    arr.forEach(function (v) { var k = String(v); if (!seen[k]) { seen[k] = 1; out.push(v); } });
    return out;
  }

  /* ------------------------------------------------------------------
   * 3. TOPICS & DIFFICULTY BANDS
   * ---------------------------------------------------------------- */
  var TOPICS = [
    { id: "cube", label: "Cubes of numbers", icon: "\ud83e\uddca", blurb: "Calculate n\u00b3" },
    { id: "cuberoot", label: "Cube roots", icon: "\u221b", blurb: "Find \u221bn for perfect cubes" },
    { id: "perfect", label: "Perfect-cube recognition", icon: "\u2705", blurb: "Is it a perfect cube?" },
    { id: "factor", label: "Prime factorisation", icon: "\ud83d\udd0d", blurb: "Factors \u2192 cube roots" },
    { id: "multdiv", label: "Multiply / divide to a cube", icon: "\u00d7", blurb: "Smallest multiplier / divisor" },
    { id: "missing", label: "Missing factors", icon: "\u2753", blurb: "Complete the equation" },
    { id: "exponent", label: "Exponent reasoning", icon: "\u2073", blurb: "Powers & roots" },
    { id: "exam", label: "Exam-style problems", icon: "\ud83c\udf93", blurb: "Multi-step questions" }
  ];
  var TOPIC_IDS = TOPICS.map(function (t) { return t.id; });
  function topicMeta(id) { for (var i = 0; i < TOPICS.length; i++) { if (TOPICS[i].id === id) { return TOPICS[i]; } } return { id: id, label: id, icon: "" }; }

  // Difficulty controls the number range only. Level 1..3.
  var DIFFICULTIES = [
    { level: 1, label: "Easy", rootMax: 10, note: "cubes up to 10\u00b3 = 1000" },
    { level: 2, label: "Moderate", rootMax: 15, note: "cubes up to 15\u00b3 = 3375" },
    { level: 3, label: "Hard", rootMax: 25, note: "cubes up to 25\u00b3 = 15625" }
  ];
  function difficultyMeta(level) {
    for (var i = 0; i < DIFFICULTIES.length; i++) { if (DIFFICULTIES[i].level === level) { return DIFFICULTIES[i]; } }
    return DIFFICULTIES[0];
  }

  /* ------------------------------------------------------------------
   * 4. ANSWER VALIDATION
   * ---------------------------------------------------------------- */
  function normaliseAnswer(v) {
    if (typeof v === "number") { return Number.isInteger(v) ? v : NaN; }
    if (v === null || v === undefined) { return NaN; }
    var s = String(v).trim().toLowerCase();
    if (s === "") { return NaN; }
    s = s.replace(/[\s,_]/g, "");
    s = s.replace(/[\u2212\u2013\u2014]/g, "-");
    s = s.replace(/\u221b/g, ""); // tolerate a leading root sign
    if (/^-?\d+$/.test(s)) { return parseInt(s, 10); }
    var f = Number(s);
    if (!isNaN(f) && Number.isInteger(f)) { return f; }
    return NaN;
  }

  function checkAnswer(q, raw) {
    if (!q) { return { correct: false, normalised: NaN }; }
    if (q.kind === "choice") {
      var idx = raw;
      if (typeof raw === "string" && q.options) {
        var found = q.options.indexOf(raw);
        idx = found !== -1 ? found : raw;
      }
      var ok = Number(idx) === q.correctIndex;
      return { correct: ok, normalised: idx };
    }
    if (q.kind === "boolean") {
      var s = String(raw).trim().toLowerCase();
      var truthy = ["yes", "true", "y", "1", "it is", "perfect"].indexOf(s) !== -1;
      var falsy = ["no", "false", "n", "0", "not"].indexOf(s) !== -1;
      if (!truthy && !falsy) { return { correct: false, normalised: NaN }; }
      var given = truthy;
      return { correct: given === !!q.answer, normalised: given };
    }
    // numeric
    var val = normaliseAnswer(raw);
    if (isNaN(val)) { return { correct: false, normalised: NaN }; }
    var acceptable = q.acceptable || [];
    var ok2 = val === q.answer;
    if (!ok2) {
      for (var i = 0; i < acceptable.length; i++) {
        if (val === normaliseAnswer(acceptable[i])) { ok2 = true; break; }
      }
    }
    return { correct: ok2, normalised: val };
  }

  /* ------------------------------------------------------------------
   * 5. CHOICE BUILDER
   * ---------------------------------------------------------------- */
  function buildNumericChoices(correct, candidates, rng) {
    var opts = [correct];
    var pool = uniqNums(candidates.filter(function (c) {
      return Number.isInteger(c) && c !== correct && c >= 0;
    }));
    pool = shuffle(pool, rng);
    for (var i = 0; i < pool.length && opts.length < 4; i++) { opts.push(pool[i]); }
    var d = 1;
    while (opts.length < 4) { var cand = correct + d; if (opts.indexOf(cand) === -1) { opts.push(cand); } d = d > 0 ? -d : (-d + 1); }
    opts = shuffle(opts.slice(0, 4), rng);
    return { options: opts.map(String), correctIndex: opts.indexOf(correct) };
  }

  function buildTextChoices(correct, distractors, rng) {
    var opts = [correct];
    var pool = distractors.filter(function (c) { return c !== correct; });
    for (var i = 0; i < pool.length && opts.length < 4; i++) {
      if (opts.indexOf(pool[i]) === -1) { opts.push(pool[i]); }
    }
    opts = shuffle(opts, rng);
    return { options: opts, correctIndex: opts.indexOf(correct) };
  }

  /* ------------------------------------------------------------------
   * 6. QUESTION GENERATORS (one per topic)
   * ---------------------------------------------------------------- */
  var QID = 0;
  function nextId() { QID += 1; return "cq-" + QID; }

  function base(topic, level, rng) {
    return {
      id: nextId(),
      topic: topic,
      topicLabel: topicMeta(topic).label,
      topicIcon: topicMeta(topic).icon,
      difficulty: level,
      difficultyLabel: difficultyMeta(level).label,
      marks: level
    };
  }

  function genCube(level, rng) {
    var band = difficultyMeta(level);
    var n = ri(2, band.rootMax, rng);
    var ans = cube(n);
    var q = base("cube", level, rng);
    q.kind = "number";
    q.prompt = "Find " + n + "\u00b3 (the cube of " + n + ").";
    q.answer = ans;
    q.acceptable = [];
    q.hint = n + "\u00b3 means " + n + " \u00d7 " + n + " \u00d7 " + n + ".";
    q.explanation = n + "\u00b3 = " + n + " \u00d7 " + n + " \u00d7 " + n + " = " + ans + ".";
    if (rng() < 0.5) {
      var c = buildNumericChoices(ans, [square(n), square(n) * n - n, cube(n + 1), cube(n - 1), n * 2], rng);
      q.kind = "choice"; q.options = c.options; q.correctIndex = c.correctIndex;
    }
    return q;
  }

  function genCubeRoot(level, rng) {
    var band = difficultyMeta(level);
    var n = ri(2, band.rootMax, rng);
    var q = base("cuberoot", level, rng);
    q.kind = "number";
    q.prompt = "Find \u221b" + cube(n) + " (the cube root of " + cube(n) + ").";
    q.answer = n;
    q.acceptable = [];
    q.hint = "Look for a number that multiplies by itself three times to give " + cube(n) + ".";
    q.explanation = "Since " + n + "\u00b3 = " + cube(n) + ", we get \u221b" + cube(n) + " = " + n + ".";
    if (rng() < 0.5) {
      var c = buildNumericChoices(n, [n + 1, n - 1, square(n), Math.round(cube(n) / 3)], rng);
      q.kind = "choice"; q.options = c.options; q.correctIndex = c.correctIndex;
    }
    return q;
  }

  function genPerfect(level, rng) {
    var band = difficultyMeta(level);
    var wantCube = rng() < 0.5;
    var n, isCube;
    if (wantCube) {
      n = cube(ri(2, band.rootMax, rng));
      isCube = true;
    } else {
      // Build a guaranteed NON-cube: some prime exponent not divisible by 3.
      var base1 = ri(2, Math.min(6, band.rootMax), rng);
      var extra = pick([1, 2, 4, 5], rng); // multiply by a prime to a power not a multiple of 3
      var primes = [2, 3, 5, 7];
      var p = pick(primes, rng);
      n = cube(base1) * Math.pow(p, extra);
      while (isPerfectCube(n) || n < 2) { n += 1; }
      isCube = false;
    }
    var q = base("perfect", level, rng);
    q.kind = "boolean";
    q.prompt = "Is " + n + " a perfect cube?";
    q.answer = isCube;
    q.hint = "Try to split " + n + " into three equal factors, or check its prime factorisation.";
    if (isCube) {
      q.explanation = "Yes. " + n + " = " + integerCubeRoot(n) + "\u00b3, so it is a perfect cube.";
    } else {
      var nc = nearestCubes(n);
      q.explanation = "No. The perfect cubes near " + n + " are " + nc.lower + " = " + nc.lowerRoot + "\u00b3 and " + nc.upper + " = " + nc.upperRoot + "\u00b3, so " + n + " is not a perfect cube.";
    }
    return q;
  }

  function genFactor(level, rng) {
    var band = difficultyMeta(level);
    var n = ri(2, band.rootMax, rng);
    var perfectCube = cube(n);
    var q = base("factor", level, rng);
    q.kind = "number";
    q.prompt = "Using prime factorisation, find \u221b" + perfectCube + ".";
    q.answer = n;
    q.acceptable = [];
    q.hint = "Write " + perfectCube + " as a product of prime powers, then group the primes into triples.";
    q.explanation = perfectCube + " = " + formatFactorisation(perfectCube) + ", so \u221b" + perfectCube + " = " + n + ".";
    if (rng() < 0.4) {
      var c = buildNumericChoices(n, [-1, +1, +2].map(function (d) { return n + d; }).concat([square(n)]), rng);
      q.kind = "choice"; q.options = c.options; q.correctIndex = c.correctIndex;
    }
    return q;
  }

  function genMultDiv(level, rng) {
    var band = difficultyMeta(level);
    var n;
    do { n = ri(2, band.rootMax * 4, rng); } while (isPerfectCube(n));
    var mode = rng() < 0.5 ? "multiply" : "divide";
    var ans = mode === "multiply" ? minMultiplierToCube(n) : minDivisorToCube(n);
    var q = base("multdiv", level, rng);
    q.kind = "number";
    if (mode === "multiply") {
      q.prompt = "Find the smallest positive integer by which " + n + " must be multiplied to make a perfect cube.";
      q.explanation = "Prime factors: " + n + " = " + formatFactorisation(n) + ". Top up each exponent to a multiple of 3, so multiply by " + ans + ".";
    } else {
      q.prompt = "Find the smallest positive integer by which " + n + " must be divided to make a perfect cube.";
      q.explanation = "Prime factors: " + n + " = " + formatFactorisation(n) + ". Remove the extra factors (exponents not divisible by 3) by dividing by " + ans + ".";
    }
    q.answer = ans;
    q.acceptable = [];
    q.hint = "Write " + n + " in prime-factor form and make every exponent a multiple of 3.";
    if (rng() < 0.5) {
      var c = buildNumericChoices(ans, [ans * 2, ans + 1, Math.max(1, ans - 1), n % 9 || 3], rng);
      q.kind = "choice"; q.options = c.options; q.correctIndex = c.correctIndex;
    }
    return q;
  }

  function genMissing(level, rng) {
    var band = difficultyMeta(level);
    var n = ri(2, band.rootMax, rng);
    var form = ri(1, 3, rng);
    var q = base("missing", level, rng);
    q.kind = "number";
    if (form === 1) {
      q.prompt = "Complete: " + n + "\u00b3 = ?";
      q.answer = cube(n);
      q.hint = "Three equal factors of " + n + ".";
      q.explanation = n + "\u00b3 = " + cube(n) + ".";
    } else if (form === 2) {
      q.prompt = "Complete: ?\u00b3 = " + cube(n);
      q.answer = n;
      q.hint = "Which number cubed gives " + cube(n) + "?";
      q.explanation = "Because " + n + "\u00b3 = " + cube(n) + ", the missing number is " + n + ".";
    } else {
      q.prompt = "Complete: \u221b" + cube(n) + " = ?";
      q.answer = n;
      q.hint = "The cube root undoes cubing.";
      q.explanation = "\u221b" + cube(n) + " = " + n + " since " + n + "\u00b3 = " + cube(n) + ".";
    }
    q.acceptable = [];
    if (rng() < 0.4) {
      var c = buildNumericChoices(q.answer, [q.answer + 1, q.answer - 1, q.answer * 2, square(q.answer)], rng);
      q.kind = "choice"; q.options = c.options; q.correctIndex = c.correctIndex;
    }
    return q;
  }

  function genExponent(level, rng) {
    var band = difficultyMeta(level);
    var a = ri(2, Math.min(6, band.rootMax), rng);
    var q = base("exponent", level, rng);
    var form = ri(1, 2, rng);
    if (form === 1) {
      q.kind = "number";
      q.prompt = "If x\u00b3 = " + cube(a) + ", find x.";
      q.answer = a;
      q.acceptable = [];
      q.hint = "Take the cube root of both sides.";
      q.explanation = "x = \u221b" + cube(a) + " = " + a + ".";
    } else {
      // (a^3)^2 style exponent reasoning kept at school level: (a³) = a×a×a
      q.kind = "number";
      q.prompt = "Write " + a + "\u00b3 as a single whole number.";
      q.answer = cube(a);
      q.acceptable = [];
      q.hint = "Expand a\u00b3 = a \u00d7 a \u00d7 a.";
      q.explanation = a + "\u00b3 = " + a + " \u00d7 " + a + " \u00d7 " + a + " = " + cube(a) + ".";
    }
    return q;
  }

  function genExam(level, rng) {
    var q = base("exam", level, rng);
    var variant = ri(1, 3, rng);
    if (variant === 1) {
      // Cube root of a product of prime powers.
      var a = ri(2, 4, rng), b = ri(2, 4, rng);
      var n = Math.pow(2, 3 * a) * Math.pow(3, 3 * b);
      q.kind = "number";
      q.prompt = "Find \u221b(" + formatFactorisation(n) + ") without long division.";
      q.answer = Math.pow(2, a) * Math.pow(3, b);
      q.acceptable = [];
      q.hint = "Split each exponent into three equal parts.";
      q.explanation = formatFactorisation(n) + " = (" + Math.pow(2, a) + " \u00d7 " + Math.pow(3, b) + ")\u00b3, so the cube root is " + q.answer + ".";
    } else if (variant === 2) {
      // Volume of a cube -> side length.
      var s = ri(2, difficultyMeta(level).rootMax, rng);
      q.kind = "number";
      q.prompt = "A cube has volume " + cube(s) + " cm\u00b3. Find its side length in cm.";
      q.answer = s;
      q.acceptable = [];
      q.unit = "cm";
      q.hint = "Volume of a cube = side\u00b3; so side = \u221bvolume.";
      q.explanation = "Side = \u221b" + cube(s) + " = " + s + " cm because " + s + "\u00b3 = " + cube(s) + ".";
    } else {
      // Two-step: smallest multiplier then cube root.
      var m;
      do { m = ri(2, 40, rng); } while (isPerfectCube(m));
      var k = minMultiplierToCube(m);
      var prod = m * k;
      q.kind = "number";
      q.prompt = m + " is multiplied by the smallest integer that makes a perfect cube. What is the cube root of the result?";
      q.answer = integerCubeRoot(prod);
      q.acceptable = [];
      q.hint = "First find the smallest multiplier, multiply, then take the cube root.";
      q.explanation = m + " = " + formatFactorisation(m) + ", so multiply by " + k + " to get " + prod + ". \u221b" + prod + " = " + integerCubeRoot(prod) + ".";
    }
    return q;
  }

  var GENERATORS = {
    cube: genCube,
    cuberoot: genCubeRoot,
    perfect: genPerfect,
    factor: genFactor,
    multdiv: genMultDiv,
    missing: genMissing,
    exponent: genExponent,
    exam: genExam
  };

  // Public: generate a question for a topic (or any topic when omitted).
  function generateQuestion(opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random;
    var level = clamp(Math.round(opts.difficulty || 1), 1, 3);
    var topic = opts.topic;
    if (!topic || TOPIC_IDS.indexOf(topic) === -1) { topic = pick(TOPIC_IDS, rng); }
    var gen = GENERATORS[topic] || genCube;
    var q = gen(level, rng);
    // Guard: never emit a non-integer numeric answer.
    if (q.kind === "number" && !Number.isInteger(q.answer)) {
      return generateQuestion({ topic: topic, difficulty: level, rng: rng });
    }
    return q;
  }

  /* ------------------------------------------------------------------
   * 7. BOT OPPONENT MODEL
   * ---------------------------------------------------------------- */
  var BOTS = {
    rookie: { id: "rookie", name: "Rookie Bot", icon: "\ud83e\udd16", skill: 0.62, baseMs: 9000, jitterMs: 3500, maxDifficulty: 1, note: "Basic cubes and familiar perfect cubes." },
    pro: { id: "pro", name: "Pro Bot", icon: "\ud83e\udd16", skill: 0.78, baseMs: 7000, jitterMs: 3000, maxDifficulty: 2, note: "Larger cubes, cube roots and mixed challenges." },
    genius: { id: "genius", name: "Genius Bot", icon: "\ud83e\udd16", skill: 0.88, baseMs: 5500, jitterMs: 2500, maxDifficulty: 3, note: "Prime factorisation, missing factors and multi-step problems." }
  };

  // Bot answers using the SAME question object and rules as the player.
  // No hidden advantage: it simply has a per-question success probability
  // derived from skill and difficulty, and a response-time profile.
  function botResolve(q, bot, rng) {
    var diff = q.difficulty || 1;
    var p = clamp(bot.skill - (diff - 1) * 0.14, 0.2, 0.97);
    var correct = rng() < p;
    var ms = Math.max(1200, Math.round(bot.baseMs + (rng() * 2 - 1) * bot.jitterMs + diff * 500));
    var answer;
    if (correct) {
      answer = (q.kind === "choice") ? q.correctIndex : q.answer;
    } else {
      if (q.kind === "choice") {
        var wrong = [];
        for (var i = 0; i < q.options.length; i++) { if (i !== q.correctIndex) { wrong.push(i); } }
        answer = pick(wrong, rng);
      } else if (q.kind === "boolean") {
        answer = !q.answer;
      } else {
        answer = q.answer + pick([1, -1, 2, -2], rng);
        if (answer === q.answer) { answer += 1; }
      }
    }
    return { correct: correct, answer: answer, ms: ms };
  }

  /* ------------------------------------------------------------------
   * 8. ADAPTIVE DIFFICULTY ENGINE (rule-based, transparent)
   * ---------------------------------------------------------------- */
  function newAdaptiveState() {
    return {
      level: 1,
      recent: [],          // recent results (1 correct / 0 wrong)
      streak: 0,
      streakWrong: 0,
      topicStats: {},      // topic -> {correct,total}
      fastGuesses: 0,      // correct but suspiciously quick (not mastery)
      total: 0
    };
  }

  function recordResult(state, q, correct, elapsedMs, usedHint) {
    state.total += 1;
    state.recent.push(correct ? 1 : 0);
    if (state.recent.length > 8) { state.recent.shift(); }
    if (correct) {
      // A "fast guess" is a correct answer under ~1.2s on a Hard item:
      // too quick to be genuine mastery, so it does not raise difficulty.
      if (elapsedMs != null && elapsedMs < 1200 && q.difficulty >= 3) { state.fastGuesses += 1; }
      state.streak += 1; state.streakWrong = 0;
    } else {
      state.streakWrong += 1; state.streak = 0;
    }
    var ts = state.topicStats[q.topic] || (state.topicStats[q.topic] = { correct: 0, total: 0 });
    ts.total += 1; if (correct) { ts.correct += 1; }
    if (usedHint) { state.streak = Math.min(state.streak, 1); }
    return state;
  }

  // Decide the NEXT difficulty level and give a friendly reason.
  function adapt(state) {
    var prev = state.level;
    var last = state.recent.slice(-4);
    var recentCorrect = last.filter(function (x) { return x === 1; }).length;
    var recentWrong = last.length - recentCorrect;
    var reason;
    if (recentWrong >= 3 || state.streakWrong >= 3) {
      state.level = clamp(prev - 1, 1, 3);
      reason = "You missed a few in a row, so we stepped down to " + difficultyMeta(state.level).label + " to rebuild confidence.";
    } else if (recentCorrect >= 3 && last.length >= 3 && state.fastGuesses < 2) {
      state.level = clamp(prev + 1, 1, 3);
      reason = "Three or more correct in a row, so we stepped up to " + difficultyMeta(state.level).label + ".";
    } else {
      state.level = prev;
      reason = "Staying at " + difficultyMeta(state.level).label + " for now.";
    }
    return { level: state.level, changed: state.level !== prev, reason: reason };
  }

  // Topic the player should practise next (weakest topic with enough data).
  function suggestedTopic(state) {
    var worst = null;
    Object.keys(state.topicStats).forEach(function (t) {
      var s = state.topicStats[t];
      if (s.total >= 2) {
        var acc = s.correct / s.total;
        if (!worst || acc < worst.acc) { worst = { topic: t, acc: acc }; }
      }
    });
    return worst ? worst.topic : null;
  }

  /* ------------------------------------------------------------------
   * 9. SCORING, XP, LEVELS, ACHIEVEMENTS
   * ---------------------------------------------------------------- */
  // Accuracy weighted above speed; difficulty scales base points.
  function scoreAnswer(correct, difficulty, timeRatio, streak) {
    if (!correct) { return 0; }
    var base = 10 + difficulty * 5;              // 15 / 20 / 25
    var timeBonus = Math.round(base * 0.4 * clamp(1 - (timeRatio || 0), 0, 1));
    var streakBonus = Math.min(10, Math.floor((streak || 1) / 3) * 2);
    return base + timeBonus + streakBonus;
  }

  function levelThreshold(level) { return 100 * level * level; } // L1=100, L2=400, L3=900 ...
  function levelFromXp(xp) {
    var level = 1;
    while (xp >= levelThreshold(level) && level < 60) { level += 1; }
    var floorXp = levelThreshold(level - 1);
    var ceilXp = levelThreshold(level);
    var span = ceilXp - floorXp;
    return { level: level, into: xp - floorXp, span: span, next: ceilXp, pct: Math.round(((xp - floorXp) / span) * 100) };
  }

  var ACHIEVEMENTS = [
    { id: "cube-rookie", name: "Cube Rookie", icon: "\ud83e\uddca", desc: "Answer your first question correctly.", check: function (s) { return s.correct >= 1; } },
    { id: "cube-hunter", name: "Perfect Cube Hunter", icon: "\ud83c\udfaf", desc: "Get 25 questions correct.", check: function (s) { return s.correct >= 25; } },
    { id: "root-master", name: "Root Master", icon: "\u221b", desc: "Get 10 cube-root questions correct.", check: function (s) { return (s.topicCorrect && s.topicCorrect.cuberoot >= 10); } },
    { id: "factor-expert", name: "Factorisation Expert", icon: "\ud83d\udd0d", desc: "Get 8 prime-factorisation questions correct.", check: function (s) { return (s.topicCorrect && s.topicCorrect.factor >= 8); } },
    { id: "escape-artist", name: "Escape Artist", icon: "\ud83d\udd13", desc: "Escape all five escape-room chambers.", check: function (s) { return s.escapeRooms >= 5; } },
    { id: "bot-champion", name: "Cube Bot Champion", icon: "\ud83c\udfc6", desc: "Defeat the Genius Bot.", check: function (s) { return !!s.geniusBotBeaten; } },
    { id: "accuracy-ace", name: "Accuracy Ace", icon: "\ud83c\udfaf", desc: "Finish a mode with 90% accuracy (10+ questions).", check: function (s) { return s.bestAccuracy >= 0.9 && s.bestAccuracyN >= 10; } },
    { id: "streak-star", name: "Streak Star", icon: "\ud83d\udd25", desc: "Reach a 10-answer streak.", check: function (s) { return s.bestStreak >= 10; } }
  ];

  function achievementStatus(stats) { return ACHIEVEMENTS.map(function (a) { return { id: a.id, name: a.name, icon: a.icon, desc: a.desc, earned: !!a.check(stats) }; }); }
  function newlyEarned(before, after) {
    var b = {}; achievementStatus(before).forEach(function (a) { if (a.earned) { b[a.id] = 1; } });
    return achievementStatus(after).filter(function (a) { return a.earned && !b[a.id]; });
  }
  function blankStats() {
    return { xp: 0, answered: 0, correct: 0, bestStreak: 0, bestAccuracy: 0, bestAccuracyN: 0, topicCorrect: {}, escapeRooms: 0, geniusBotBeaten: false, botsBeaten: 0, daily: { date: null, count: 0 }, history: [] };
  }

  /* ------------------------------------------------------------------
   * 10. ESCAPE ROOM (deterministic, provably solvable data)
   * ---------------------------------------------------------------- */
  // Each puzzle either references a generator spec or is fully literal with
  // a verified answer. Every answer can be re-derived from the clue shown.
  var ROOMS = [
    {
      id: 1, name: "The Cube Gate", icon: "\ud83d\udeaa",
      brief: "The gate is sealed by three cube locks. Compute each cube to open it.",
      puzzles: [
        { kind: "number", prompt: "Lock A: find 4\u00b3.", answer: 64, hint: "4 \u00d7 4 \u00d7 4.", explanation: "4\u00b3 = 4 \u00d7 4 \u00d7 4 = 64." },
        { kind: "number", prompt: "Lock B: find 6\u00b3.", answer: 216, hint: "Three equal factors of 6.", explanation: "6\u00b3 = 216." },
        { kind: "boolean", prompt: "Lock C: is 64 a perfect cube?", answer: true, hint: "Can you split 64 into three equal factors?", explanation: "64 = 4\u00b3, so yes." }
      ]
    },
    {
      id: 2, name: "The Root Chamber", icon: "\ud83d\udd22",
      brief: "Roots hold the second door. Take the cube root of each perfect cube.",
      puzzles: [
        { kind: "number", prompt: "Find \u221b125.", answer: 5, hint: "Which number cubed gives 125?", explanation: "5\u00b3 = 125, so \u221b125 = 5." },
        { kind: "number", prompt: "Find \u221b512.", answer: 8, hint: "8 \u00d7 8 \u00d7 8.", explanation: "8\u00b3 = 512, so \u221b512 = 8." },
        { kind: "boolean", prompt: "Is 27 a perfect cube?", answer: true, hint: "3 \u00d7 3 \u00d7 3.", explanation: "27 = 3\u00b3, yes." }
      ]
    },
    {
      id: 3, name: "The Factorisation Vault", icon: "\ud83d\uddc4\ufe0f",
      brief: "The vault demands prime factorisation. Group primes into triples to escape.",
      puzzles: [
        { kind: "number", prompt: "216 = 2\u00b3 \u00d7 3\u00b3. Find \u221b216.", answer: 6, hint: "Take one factor from each triple.", explanation: "216 = (2 \u00d7 3)\u00b3 = 6\u00b3, so \u221b216 = 6." },
        { kind: "number", prompt: "Find \u221b1728. (Hint: 1728 = 2\u2076 \u00d7 3\u00b3)", answer: 12, hint: "Split 2\u2076 into two triples of 2\u00b3.", explanation: "1728 = (2\u00b2 \u00d7 3)\u00b3 = 12\u00b3, so \u221b1728 = 12." },
        { kind: "choice", prompt: "Which prime exponent pattern proves 216 is a perfect cube?", options: ["2\u00b3 \u00d7 3\u00b3", "2\u00b2 \u00d7 3\u00b3", "2\u00b3 \u00d7 3\u00b2", "2\u2074 \u00d7 3\u00b3"], correctIndex: 0, hint: "Every exponent must be a multiple of 3.", explanation: "216 = 2\u00b3 \u00d7 3\u00b3; both exponents are multiples of 3." }
      ]
    },
    {
      id: 4, name: "The Missing Number Lab", icon: "\ud83e\uddea",
      brief: "Equations with blanks. Restore each missing value to release the lock.",
      puzzles: [
        { kind: "number", prompt: "7\u00b3 = ?", answer: 343, hint: "7 \u00d7 7 \u00d7 7.", explanation: "7\u00b3 = 343." },
        { kind: "number", prompt: "?\u00b3 = 1000", answer: 10, hint: "Which number cubed gives 1000?", explanation: "10\u00b3 = 1000." },
        { kind: "number", prompt: "Find the smallest positive integer to multiply 108 by to reach a perfect cube.", answer: 2, hint: "108 = 2\u00b2 \u00d7 3\u00b3; fix the exponent of 2.", explanation: "108 = 2\u00b2 \u00d7 3\u00b3; multiply by 2 to get 2\u00b3 \u00d7 3\u00b3 = 216 = 6\u00b3." }
      ]
    },
    {
      id: 5, name: "The Final Lock", icon: "\ud83d\udd10",
      brief: "One multi-step code stands between you and freedom. Think it through.",
      puzzles: [
        { kind: "number", prompt: "Take the smallest multiplier of 40 that makes a perfect cube, then find the cube root of the result.", answer: null, hint: "40 = 2\u00b3 \u00d7 5; multiply by 25 to get 1000.", explanation: "40 = 2\u00b3 \u00d7 5, so multiply by 5\u00b2 = 25 to reach 1000 = 10\u00b3. Cube root = 10.", resolve: function () { var k = minMultiplierToCube(40); return integerCubeRoot(40 * k); } },
        { kind: "number", prompt: "A cubical tank holds 8000 litres. Find its edge length in cm-style units (1 unit\u00b3 = 1 litre).", answer: 20, hint: "Edge = \u221bvolume.", explanation: "\u221b8000 = 20 since 20\u00b3 = 8000; edge = 20 units." },
        { kind: "boolean", prompt: "Final check: is 8 a perfect cube AND is \u221b8 = 2?", answer: true, hint: "8 = 2\u00b3.", explanation: "8 = 2\u00b3, so yes to both." }
      ]
    }
  ];

  function resolveEscapePuzzle(p) {
    var out = Object.assign({}, p);
    if (out.resolve) { out.answer = out.resolve(); }
    return out;
  }
  function roomPuzzles(room) { return room.puzzles.map(resolveEscapePuzzle); }

  // Validate that every escape puzzle has a determinate answer (test hook).
  function validateEscapeRooms() {
    var problems = [];
    ROOMS.forEach(function (room) {
      roomPuzzles(room).forEach(function (p, i) {
        if (p.kind === "boolean") {
          if (typeof p.answer !== "boolean") { problems.push(room.id + "." + i + " boolean answer not set"); }
        } else if (p.kind === "choice") {
          if (!p.options || p.correctIndex == null || p.correctIndex < 0 || p.correctIndex >= p.options.length) { problems.push(room.id + "." + i + " bad choice"); }
        } else {
          if (!Number.isInteger(p.answer)) { problems.push(room.id + "." + i + " non-integer answer"); }
        }
      });
    });
    return problems;
  }

  /* ------------------------------------------------------------------
   * 11. MATCHING-GAME DATA
   * ---------------------------------------------------------------- */
  // Relationship types for Perfect Cube Matching. Each returns [left, right]
  // pairs that are mathematically valid and deduplicated.
  function matchingPairs(type, count, rng, rootMax) {
    rootMax = rootMax || 10;
    var roots = shuffle(range(2, rootMax), rng).slice(0, count);
    return roots.map(function (n) {
      if (type === "num-cube") { return { left: String(n), right: String(cube(n)), sub: "number \u2192 cube" }; }
      if (type === "cube-root") { return { left: String(cube(n)), right: String(n), sub: "cube \u2192 cube root" }; }
      if (type === "expr-value") { return { left: n + "\u00b3", right: String(cube(n)), sub: "expression \u2192 value" }; }
      if (type === "factor-root") { return { left: formatFactorisation(cube(n)), right: String(n), sub: "factorisation \u2192 root" }; }
      // diagram-count
      return { left: "cube-" + n, right: String(cube(n)), sub: "diagram \u2192 unit cubes", diagram: n };
    });
  }
  function range(a, b) { var out = []; for (var i = a; i <= b; i++) { out.push(i); } return out; }

  /* ------------------------------------------------------------------
   * EXPORTS
   * ---------------------------------------------------------------- */
  CQ.square = square;
  CQ.cube = cube;
  CQ.integerCubeRoot = integerCubeRoot;
  CQ.isPerfectCube = isPerfectCube;
  CQ.factorize = factorize;
  CQ.isPerfectCubeByFactors = isPerfectCubeByFactors;
  CQ.minMultiplierToCube = minMultiplierToCube;
  CQ.minDivisorToCube = minDivisorToCube;
  CQ.formatFactorisation = formatFactorisation;
  CQ.superscript = superscript;
  CQ.nearestCubes = nearestCubes;
  CQ.gcd = gcd;

  CQ.seededRng = seededRng;
  CQ.ri = ri;
  CQ.pick = pick;
  CQ.shuffle = shuffle;
  CQ.clamp = clamp;

  CQ.TOPICS = TOPICS;
  CQ.TOPIC_IDS = TOPIC_IDS;
  CQ.topicMeta = topicMeta;
  CQ.DIFFICULTIES = DIFFICULTIES;
  CQ.difficultyMeta = difficultyMeta;

  CQ.normaliseAnswer = normaliseAnswer;
  CQ.checkAnswer = checkAnswer;
  CQ.buildNumericChoices = buildNumericChoices;
  CQ.buildTextChoices = buildTextChoices;

  CQ.generateQuestion = generateQuestion;
  CQ.generators = GENERATORS;

  CQ.BOTS = BOTS;
  CQ.botResolve = botResolve;

  CQ.newAdaptiveState = newAdaptiveState;
  CQ.recordResult = recordResult;
  CQ.adapt = adapt;
  CQ.suggestedTopic = suggestedTopic;

  CQ.scoreAnswer = scoreAnswer;
  CQ.levelFromXp = levelFromXp;
  CQ.levelThreshold = levelThreshold;
  CQ.ACHIEVEMENTS = ACHIEVEMENTS;
  CQ.achievementStatus = achievementStatus;
  CQ.newlyEarned = newlyEarned;
  CQ.blankStats = blankStats;

  CQ.ROOMS = ROOMS;
  CQ.roomPuzzles = roomPuzzles;
  CQ.validateEscapeRooms = validateEscapeRooms;
  CQ.matchingPairs = matchingPairs;

  return CQ;
});
