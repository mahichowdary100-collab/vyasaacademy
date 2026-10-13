/* =====================================================================
 * FRACTION QUEST - Cubes... no, Fractions! exact mathematics engine
 * ---------------------------------------------------------------------
 * Pure, dependency-free, testable module. Loads in the browser as a
 * global (window.FractionMath) and in Node via require() so it can be
 * unit tested with the built-in test runner (node --test).
 *
 * Design notes
 *  - Every fraction is stored as { n, d } with d > 0, already reduced,
 *    sign carried on n. All arithmetic is done internally with BigInt so
 *    exactness never depends on floating point.
 *  - Comparisons and equality use cross-multiplication (exact).
 *  - "Domain rules" (mathematical truth) are separate from the
 *    "difficulty range" (which numbers a generator may choose).
 *  - Randomness is injected as an rng() so results are reproducible.
 * ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else if (typeof window === "object") {
    window.FractionMath = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var FM = {};

  /* ------------------------------------------------------------------
   * 1. CORE EXACT ARITHMETIC (BigInt inside, plain numbers outside)
   * ---------------------------------------------------------------- */

  function gcdB(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }
  function toNum(n, d) {
    var N = Number(n), D = Number(d);
    if (!Number.isSafeInteger(N) || !Number.isSafeInteger(D)) {
      throw new Error("FractionQuest: result out of safe integer range");
    }
    return { n: N, d: D };
  }
  // Build a normalized (reduced) fraction. Throws on zero denominator.
  function frac(n, d, reduce) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) { throw new Error("FractionQuest: denominator cannot be zero"); }
    if (d < 0n) { n = -n; d = -d; }
    if (reduce === undefined) { reduce = true; }
    if (reduce && n !== 0n) { var g = gcdB(n, d); n /= g; d /= g; }
    if (n === 0n) { d = 1n; }
    return toNum(n, d);
  }
  function gcd(a, b) { return Number(gcdB(BigInt(a), BigInt(b))); }
  function lcm(a, b) {
    var A = BigInt(a), B = BigInt(b);
    if (A === 0n || B === 0n) { return 0; }
    return toNum((A / gcdB(A, B)) * B, 1n).n;
  }
  function eq(a, b) { return a.n * b.d === b.n * a.d; }
  // -1, 0, 1
  function cmp(a, b) {
    var l = a.n * b.d, r = b.n * a.d;
    return l === r ? 0 : (l > r ? 1 : -1);
  }
  function add(a, b) { return frac(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return frac(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return frac(a.n * b.n, a.d * b.d); }
  function div(a, b) {
    if (b.n === 0) { throw new Error("FractionQuest: division by zero fraction"); }
    return frac(a.n * b.d, a.d * b.n);
  }
  function simplify(a) { return frac(a.n, a.d); }
  function isReduced(a) { return gcdB(BigInt(a.n), BigInt(a.d)) === 1n || a.n === 0; }
  // Denominator contains only factors 2 and 5 -> terminating decimal.
  function isTerminating(a) {
    var v = simplify(a), d = BigInt(v.d);
    while (d % 2n === 0n) { d /= 2n; }
    while (d % 5n === 0n) { d /= 5n; }
    return d === 1n;
  }

  /* ----- display & conversion ----- */

  // "3/4", "-2/3", "4" (d === 1)
  function render(a) {
    a = simplify(a);
    if (a.d === 1) { return String(a.n); }
    return a.n + "/" + a.d;
  }
  // mixed display: "1 3/4", "-1 3/4", "2"
  function renderMixed(a) {
    if (a.n === 0) { return "0"; }
    var neg = a.n < 0;
    var m = Math.abs(a.n);
    var w = Math.floor(m / a.d);
    var r = m % a.d;
    var sign = neg ? "-" : "";
    if (r === 0) { return sign + w; }
    if (w === 0) { return (neg ? "-" : "") + r + "/" + a.d; }
    return sign + w + " " + r + "/" + a.d;
  }
  function toMixed(a) {
    a = simplify(a);
    var neg = a.n < 0;
    var m = Math.abs(a.n);
    var w = Math.floor(m / a.d);
    var r = m % a.d;
    return { whole: neg ? -w : w, n: r, d: a.d, neg: neg };
  }
  function fromMixed(whole, n, d) {
    if (d <= 0 || n < 0 || n >= d) { return null; }
    var w = Math.abs(whole);
    var sign = whole < 0 ? -1 : 1;
    return frac(sign * (w * d + n), d);
  }
  // Exact terminating decimal string, e.g. "0.75", "-0.5". Returns null
  // when the fraction does not terminate.
  function toDecimalString(a) {
    if (!isTerminating(a)) { return null; }
    var v = simplify(a);
    var neg = v.n < 0;
    var m = Math.abs(v.n);
    var w = Math.floor(m / v.d);
    var r = m % v.d;
    var ds = "";
    while (r !== 0) {
      r *= 10;
      ds += Math.floor(r / v.d);
      r = r % v.d;
      if (ds.length > 60) { break; }
    }
    var out = (ds === "") ? String(w) : w + "." + ds;
    return neg ? "-" + out : out;
  }
  // Exact percent string when evenly divisible: "75%". null otherwise.
  function toPercentString(a) {
    var v = simplify(a);
    if ((v.n * 100) % v.d !== 0) { return null; }
    var p = (v.n * 100) / v.d;
    return p + "%";
  }
  function compareSymbol(a, b) {
    var c = cmp(a, b);
    return c < 0 ? "<" : (c > 0 ? ">" : "=");
  }

  /* ------------------------------------------------------------------
   * 2. INPUT PARSING & VALIDATION
   * ---------------------------------------------------------------- */

  function parseDecimalToken(s, sign) {
    // s has no sign, may contain a dot. Return fraction of its exact value.
    var parts = s.split(".");
    var intPart = parts[0] === "" ? "0" : parts[0];
    var fracPart = parts.length > 1 ? parts[1] : "";
    if (fracPart === "") { return frac(Number(intPart), 1); }
    var k = fracPart.length;
    var num = Number(intPart) * Math.pow(10, k) + Number(fracPart);
    var den = Math.pow(10, k);
    var out = frac(num, den);
    return sign < 0 ? frac(-out.n, out.d) : out;
  }

  // Accepts: "3/4", "-2/3", "1 3/4", "-1 3/4", "2", "0", "0.75", ".75", "75%".
  // Returns { ok: true, value: {n,d} } or { ok: false, message }.
  function parseInput(str) {
    if (typeof str === "number" && isFinite(str)) {
      if (Number.isInteger(str)) { return { ok: true, value: frac(str, 1) }; }
      return { ok: true, value: parseDecimalToken(String(str), 1) };
    }
    if (str === null || str === undefined) { return { ok: false, message: "Empty answer." }; }
    var s = String(str).trim().toLowerCase();
    if (s === "") { return { ok: false, message: "Empty answer." }; }
    // percent: "75%", "-12.5%"
    if (s.charAt(s.length - 1) === "%") {
      var p = s.slice(0, -1);
      if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(p)) { return { ok: false, message: "Not a valid percentage." }; }
      var negP = p.charAt(0) === "-" ? -1 : 1;
      var cleanP = p.replace(/^[-+]/, "");
      var val = parseDecimalToken(cleanP, negP);
      return { ok: true, value: frac(val.n, val.d * 100) };
    }
    // mixed "w n/d" with optional sign on the whole part
    var mx = s.match(/^([-+]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mx) {
      var sig = mx[1] === "-" ? -1 : 1, w = Number(mx[2]), n = Number(mx[3]), d = Number(mx[4]);
      if (d === 0) { return { ok: false, message: "Denominator cannot be zero." }; }
      if (n >= d) { return { ok: false, message: "Mixed number part must be a proper fraction." }; }
      return { ok: true, value: frac(sig * (w * d + n), d) };
    }
    // fraction "n/d"
    var fx = s.match(/^([-+]?\d+)\s*\/\s*(\d+)$/);
    if (fx) {
      if (Number(fx[2]) === 0) { return { ok: false, message: "Denominator cannot be zero." }; }
      return { ok: true, value: frac(Number(fx[1]), Number(fx[2])) };
    }
    // decimal "12.5", ".75", "12"
    var dx = s.match(/^([-+]?)(\d+)(?:\.(\d+))?$/);
    if (dx) { return { ok: true, value: parseDecimalToken(dx[2] + (dx[3] !== undefined ? "." + dx[3] : ""), dx[1] === "-" ? -1 : 1) }; }
    var dy = s.match(/^([-+])?\.(\d+)$/);
    if (dy) { return { ok: true, value: parseDecimalToken("0." + dy[2], dy[1] === "-" ? -1 : 1) }; }
    return { ok: false, message: 'Try a form like "3/4", "1 3/4", "0.75" or "75%".' };
  }

  // Whether an MCQ index matches, or a submitted value matches the
  // question's canonical value. Returns boolean.
  function checkAnswer(q, submitted) {
    if (q.type === "mcq") {
      if (typeof submitted === "number") { return submitted === q.answer; }
      if (typeof submitted === "string") {
        var idx = q.options.indexOf(submitted.trim());
        return idx >= 0 && idx === q.answer;
      }
      return false;
    }
    if (typeof submitted === "number") {
      if (!Number.isInteger(submitted)) { return valueEqSubmitted(q, parseDecimalToken(String(submitted), 1), String(submitted)); }
      return valueEqSubmitted(q, frac(submitted, 1), String(submitted));
    }
    if (submitted && typeof submitted === "object" && typeof submitted.n === "number") {
      var v0 = frac(submitted.n, submitted.d);
      return valueEqSubmitted(q, v0, render(v0));
    }
    if (typeof submitted !== "string") { return false; }
    var raw = String(submitted).trim().toLowerCase();
    var p = parseInput(raw);
    if (!p.ok) { return false; }
    return valueEqSubmitted(q, p.value, raw);
  }
  function valueEqSubmitted(q, v, rawText) {
    if (!eq(v, q.canonical)) { return false; }
    if (q.reducedRequired) {
      var canon = simplify({ n: q.canonical.n, d: q.canonical.d });
      if (rawText !== undefined) { return rawText === render(canon); }
      return v.n === canon.n && v.d === canon.d;
    }
    return true;
  }

  /* ------------------------------------------------------------------
   * 3. LEVELS / DIFFICULTY PROFILES
   * ---------------------------------------------------------------- */

  var PROFILES = [
    { id: "foundation", label: "Foundation", classes: "Class 6-7", marks: 15, maxDen: 8, maxNum: 12, allowNeg: false, kinds: ["equiv", "simplify", "compare", "add", "decimal", "missing", "identify"] },
    { id: "intermediate", label: "Intermediate", classes: "Class 7-8", marks: 20, maxDen: 12, maxNum: 18, allowNeg: false, kinds: ["equiv", "simplify", "compare", "add", "sub", "mul", "mixed", "decimal", "missing"] },
    { id: "advanced", label: "Advanced", classes: "Class 8-9", marks: 25, maxDen: 15, maxNum: 25, allowNeg: true, kinds: ["equiv", "simplify", "compare", "add", "sub", "mul", "div", "mixed", "decimal", "percent", "missing"] },
    { id: "challenge", label: "Challenge", classes: "Class 9-10", marks: 30, maxDen: 20, maxNum: 40, allowNeg: true, kinds: ["equiv", "simplify", "compare", "add", "sub", "mul", "div", "mixed", "decimal", "percent", "missing", "word"] }
  ];

  var KIND_META = {
    identify: { label: "Identify fractions", skill: "Visual fractions" },
    equiv: { label: "Equivalent fractions", skill: "Equivalence" },
    simplify: { label: "Simplest form", skill: "Simplification" },
    compare: { label: "Compare fractions", skill: "Comparison" },
    add: { label: "Add fractions", skill: "Addition" },
    sub: { label: "Subtract fractions", skill: "Subtraction" },
    mul: { label: "Multiply fractions", skill: "Multiplication" },
    div: { label: "Divide fractions", skill: "Division" },
    mixed: { label: "Improper & mixed numbers", skill: "Fraction conversion" },
    decimal: { label: "Fractions to decimals", skill: "Decimals" },
    percent: { label: "Fractions to percentages", skill: "Percentages" },
    missing: { label: "Missing values", skill: "Proportion" },
    word: { label: "Fraction word problems", skill: "Problem solving" }
  };

  function profileMeta(id) {
    for (var i = 0; i < PROFILES.length; i++) { if (PROFILES[i].id === id) { return PROFILES[i]; } }
    return PROFILES[0];
  }
  function kindLabel(k) { return (KIND_META[k] || {}).label || k; }

  /* ------------------------------------------------------------------
   * 4. RANDOM HELPERS (injected rng)
   * ---------------------------------------------------------------- */

  function seededRng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function ri(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function clamp(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }

  function randProper(rng, b, force) {
    var den = ri(rng, 2, b.maxDen);
    var num = ri(rng, 1, Math.min(b.maxNum, den - 1));
    if (force && force.den) { den = force.den; num = ri(rng, 1, Math.min(b.maxNum, Math.max(1, den - 1))); }
    var v = frac(num, den);
    if (b.allowNeg && rng() < 0.35) { v = frac(-v.n, v.d); }
    return v;
  }
  function randImproper(rng, b) {
    var w = ri(rng, 1, 4);
    var den = ri(rng, 2, 8);
    var num = w * den + ri(rng, 1, den - 1);
    var v = frac(num, den);
    if (b.allowNeg && rng() < 0.3) { v = frac(-v.n, v.d); }
    return v;
  }
  function randUnreduced(rng, b) {
    // a reduced fraction scaled by k >= 2
    var base = frac(ri(rng, 1, 6), ri(rng, 2, 8)); // may reduce further; fine
    var k = ri(rng, 2, 4);
    return frac(base.n * k, base.d * k);
  }
  function randTerminating(rng, b) {
    var d = pick(rng, [2, 4, 5, 8, 10, 16, 20, 25]);
    var n = ri(rng, 1, Math.min(b.maxNum, d - 1));
    return frac(n, d);
  }
  function randPercentFriendly(rng, b) {
    var d = pick(rng, [2, 4, 5, 10, 20, 25]);
    var n = ri(rng, 1, Math.min(b.maxNum, d - 1));
    return frac(n, d); // n*100 always divisible by d for these d
  }

  /* ------------------------------------------------------------------
   * 5. QUESTION GENERATION
   * ---------------------------------------------------------------- */

  function uniqueOptions(opts) {
    var seen = {}, out = [];
    for (var i = 0; i < opts.length; i++) {
      if (Object.prototype.hasOwnProperty.call(seen, opts[i])) { continue; }
      seen[opts[i]] = 1; out.push(opts[i]);
    }
    return out;
  }
  function mcq(correctText, distractors, rng) {
    var opts = uniqueOptions(distractors);
    if (opts.indexOf(correctText) < 0) { opts.push(correctText); }
    var tags = opts.slice();
    var order = shuffle(rng, tags);
    var ans = -1;
    for (var i = 0; i < order.length; i++) {
      if (order[i] === correctText && ans < 0) { ans = i; }
    }
    return { options: order, answer: ans };
  }
  // Ensures 3 distinct, non-correct distractors + the correct answer
  // (falls back to fewer options when the distractor pool is small, e.g.
  // a 3-way symbol compare, which is natural for that question type).
  function mcq4(correctText, distractors, rng) {
    var dist = uniqueOptions(distractors.filter(function (d) { return d !== correctText; })).slice(0, 3);
    var opts = shuffle(rng, dist.concat([correctText]));
    return { options: opts, answer: opts.indexOf(correctText) };
  }
  // Raw (unreduced) numeric pair used ONLY for presentation text.
  function rawScale(f, k) { return { n: f.n * k, d: f.d * k }; }
  function renderRaw(r) { return r.n + "/" + r.d; }

  function baseQuestion(profile, kind, rng) {
    return {
      type: "mcq",
      kind: kind,
      profile: profile.id,
      skill: KIND_META[kind].skill,
      marks: profile.marks
    };
  }
  function baseNumeric(profile, kind, rng, canonical, reducedRequired) {
    return {
      type: "numeric",
      kind: kind,
      profile: profile.id,
      skill: KIND_META[kind].skill,
      marks: profile.marks,
      canonical: { n: canonical.n, d: canonical.d },
      reducedRequired: !!reducedRequired
    };
  }

  function generateQuestion(opts) {
    var profile = profileMeta(opts.profile);
    var b = { maxDen: profile.maxDen, maxNum: profile.maxNum, allowNeg: profile.allowNeg };
    var rng = opts.rng || Math.random;
    var kind = opts.kind || pick(rng, profile.kinds);
    if (profile.kinds.indexOf(kind) < 0) { kind = pick(rng, profile.kinds); }

    switch (kind) {
      case "equiv": return qEquiv(profile, rng);
      case "simplify": return qSimplify(profile, rng);
      case "compare": return qCompare(profile, rng);
      case "add": return qOp(profile, rng, "add");
      case "sub": return qOp(profile, rng, "sub");
      case "mul": return qOp(profile, rng, "mul");
      case "div": return qOp(profile, rng, "div");
      case "mixed": return qMixed(profile, rng);
      case "decimal": return qDecimal(profile, rng);
      case "percent": return qPercent(profile, rng);
      case "missing": return qMissing(profile, rng);
      case "word": return qWord(profile, rng);
      case "identify": return qIdentify(profile, rng);
      default: return qEquiv(profile, rng);
    }
  }

  function qEquiv(profile, rng) {
    var b = { maxDen: profile.maxDen, maxNum: profile.maxNum, allowNeg: profile.allowNeg };
    var f = randProper(rng, b);
    if (f.n === 0) { f = frac(1, 3); }
    var k = ri(rng, 2, 5);
    var rawNum = f.n * k;
    var rawDen = f.d * k;
    var q = baseNumeric(profile, "equiv", rng, { n: 0, d: 1 }, false);
    if (rng() < 0.5) {
      q.prompt = "What number makes the fractions equivalent? " + render(f) + " = " + rawNum + "/?";
      q.canonical = { n: rawDen, d: 1 };
      q.explanation = "Because " + rawNum + "/" + rawDen + " equals " + render(f) + ", the missing denominator is " + rawDen + ".";
    } else {
      q.prompt = "What number makes the fractions equivalent? " + render(f) + " = ?/" + rawDen;
      q.canonical = { n: rawNum, d: 1 };
      q.explanation = "Multiply numerator " + f.n + " by the same factor (" + k + "): " + f.n + " \u00d7 " + k + " = " + rawNum + ".";
    }
    q.hint = "Multiply both parts of the fraction by the same whole number.";
    return q;
  }

  function qSimplify(profile, rng) {
    var base = frac(ri(rng, 1, 6), ri(rng, 2, 8));
    var g = ri(rng, 2, 4);
    var unit = rawScale(base, g);
    var distractors = [
      renderRaw(unit),
      renderRaw({ n: base.n, d: base.d * g }),
      renderRaw({ n: base.n * g, d: base.d })
    ];
    var m = mcq4(render(base), distractors, rng);
    var q = baseQuestion(profile, "simplify", rng);
    q.prompt = "Write " + renderRaw(unit) + " in simplest form.";
    q.options = m.options;
    q.answer = m.answer;
    q.explanation = "The greatest common factor of " + unit.n + " and " + unit.d + " is " + g + ", so divide both by " + g + ": " + renderRaw(unit) + " = " + render(base) + ".";
    q.hint = "What is the greatest common factor of the numerator and denominator?";
    return q;
  }

  function qCompare(profile, rng) {
    var b = { maxDen: profile.maxDen, maxNum: profile.maxNum, allowNeg: profile.allowNeg };
    var a = randProper(rng, b), c = randProper(rng, b);
    var guard = 0;
    while (eq(a, c) && guard < 8) { c = randProper(rng, b); guard++; }
    if (eq(a, c)) { c = frac(a.n + 1, a.d); } // never compare a fraction to itself
    var sym = compareSymbol(a, c);
    var m = mcq4(sym, ["<", ">", "="], rng);
    var q = baseQuestion(profile, "compare", rng);
    q.prompt = "Which symbol correctly compares " + render(a) + "  \u25a1  " + render(c) + "?";
    q.options = m.options;
    q.answer = m.answer;
    if (cmp(a, c) > 0) {
      q.explanation = "Cross-multiply: " + a.n + " \u00d7 " + c.d + " = " + (a.n * c.d) + " and " + c.n + " \u00d7 " + a.d + " = " + (c.n * a.d) + ". Since " + (a.n * c.d) + " > " + (c.n * a.d) + ", " + render(a) + " > " + render(c) + ".";
    } else {
      q.explanation = "Cross-multiply: " + a.n + " \u00d7 " + c.d + " = " + (a.n * c.d) + " and " + c.n + " \u00d7 " + a.d + " = " + (c.n * a.d) + ". Since " + (a.n * c.d) + " < " + (c.n * a.d) + ", " + render(a) + " < " + render(c) + ".";
    }
    q.hint = "Use a common denominator or cross multiplication.";
    return q;
  }

  function qOp(profile, rng, op) {
    var b = { maxDen: profile.maxDen, maxNum: profile.maxNum, allowNeg: profile.allowNeg };
    var a, c;
    if (op === "add" && profile.id === "foundation") {
      var d = ri(rng, 2, Math.min(6, b.maxDen));
      a = frac(ri(rng, 1, d - 1), d);
      c = frac(ri(rng, 1, d - 1), d);
    } else {
      a = randProper(rng, b);
      c = randProper(rng, b);
      if (op === "sub") {
        var guard = 0;
        while (cmp(a, c) < 0 && !b.allowNeg && guard < 10) { c = randProper(rng, b); guard++; }
        if (cmp(a, c) < 0 && !b.allowNeg) { var t = a; a = c; c = t; }
      }
    }
    var result;
    if (op === "add") { result = add(a, c); }
    else if (op === "sub") { result = sub(a, c); }
    else if (op === "mul") { result = mul(a, c); }
    else { result = div(a, c); }

    var sym = { add: "+", sub: "\u2212", mul: "\u00d7", div: "\u00f7" }[op];
    var q = baseNumeric(profile, op, rng, result, false);
    q.prompt = "Calculate: " + render(a) + " " + sym + " " + render(c) + " = ?";
    q.hint = opExplainer(a, c, op, result, q);
    q.explanation = q.hint;
    return q;
  }

  function opExplainer(a, c, op, result, q) {
    if (op === "add" || op === "sub") {
      if (a.d === c.d) {
        var signWord = op === "add" ? "add" : "subtract";
        return "Same denominators: just " + signWord + " the numerators. " + a.n + (op === "add" ? " + " : " \u2212 ") + c.n + " = " + result.n + ", so the answer is " + render(result) + ".";
      }
      var ca = frac(a.n * lcm(a.d, c.d) / a.d, lcm(a.d, c.d));
      var cb = frac(c.n * lcm(a.d, c.d) / c.d, lcm(a.d, c.d));
      if (op === "add") {
        return "Common denominator is " + lcm(a.d, c.d) + ": " + render(ca) + " + " + render(cb) + " = " + render(result) + ".";
      }
      return "Common denominator is " + lcm(a.d, c.d) + ": " + render(ca) + " \u2212 " + render(cb) + " = " + render(result) + ".";
    }
    if (op === "mul") {
      return "Multiply across: (" + a.n + " \u00d7 " + c.n + ") over (" + a.d + " \u00d7 " + c.d + ") = " + render(result) + ".";
    }
    return "Flip the second fraction and multiply: " + render(a) + " \u00d7 " + c.d + "/" + c.n + " = " + render(result) + ".";
  }

  function qMixed(profile, rng, forceMcq) {
    var v = randImproper(rng, { maxDen: 8, maxNum: 60, allowNeg: profile.allowNeg });
    if (forceMcq || rng() < 0.5) {
      // improper -> mixed, MCQ
      var text = renderMixed(v);
      var opts = [];
      opts.push(renderMixed(frac(v.n, v.d)));
      opts.push(renderMixed(frac(v.n + v.d, v.d)));
      opts.push(renderMixed(frac(v.n - v.d, v.d)));
      var m = mcq(text, uniqueOptions(opts), rng);
      var q = baseQuestion(profile, "mixed", rng);
      q.prompt = "Write " + render(v) + " as a mixed number.";
      q.options = m.options; q.answer = m.answer;
      q.explanation = "Divide " + Math.abs(v.n) + " by " + v.d + ": " + toMixed(v).whole + " remainder " + Math.abs(v.n) % v.d + ", so the mixed number is " + text + ".";
      q.hint = "How many whole parts does the numerator contain?";
      return q;
    }
    // mixed -> improper, numeric
    var m2 = toMixed(v);
    var target = v;
    var q2 = baseNumeric(profile, "mixed", rng, target, false);
    q2.prompt = "Write " + renderMixed(v) + " as an improper fraction.";
    q2.explanation = "Whole part \u00d7 denominator + numerator = " + Math.abs(m2.whole) + " \u00d7 " + m2.d + " + " + m2.n + " = " + (Math.abs(m2.whole) * m2.d + m2.n) + ", so the improper fraction is " + render(target) + ".";
    q2.hint = "Multiply the whole number by the denominator, then add the numerator.";
    return q2;
  }

  function qDecimal(profile, rng) {
    var f = randTerminating(rng, { maxDen: profile.maxDen, maxNum: profile.maxNum, allowNeg: profile.allowNeg });
    var ds = toDecimalString(f);
    var q = baseNumeric(profile, "decimal", rng, f, false);
    q.prompt = "Write " + render(f) + " as a decimal.";
    q.explanation = "Divide the numerator by the denominator: " + render(f) + " = " + ds + ".";
    q.hint = "Think of the fraction as a division. 1/4 is a quarter, or 0.25.";
    q.acceptForms = "decimal";
    return q;
  }

  function qPercent(profile, rng) {
    var f = randPercentFriendly(rng, { maxDen: profile.maxDen, maxNum: profile.maxNum, allowNeg: profile.allowNeg });
    var ps = toPercentString(f);
    var q = baseNumeric(profile, "percent", rng, f, false);
    q.prompt = "Write " + render(f) + " as a percentage.";
    q.explanation = render(f) + " means " + f.n + " out of " + f.d + ", which is " + ps + ".";
    q.hint = "A percentage is out of 100. 3/4 of 100% is 75%.";
    q.acceptForms = "percent";
    return q;
  }

  function qMissing(profile, rng) {
    var f = randProper(rng, { maxDen: profile.maxDen, maxNum: profile.maxNum, allowNeg: false });
    var k = ri(rng, 2, 5);
    var rawNum = f.n * k;
    var rawDen = f.d * k;
    var q;
    if (rng() < 0.5) {
      q = baseNumeric(profile, "missing", rng, { n: rawNum, d: 1 }, false);
      q.prompt = "?" + "/" + rawDen + " is equivalent to " + render(f) + ". What is the missing numerator?";
      q.explanation = "Multiply " + f.n + " by the same factor " + k + ": " + f.n * k + ". So the missing numerator is " + rawNum + ".";
    } else {
      q = baseNumeric(profile, "missing", rng, { n: rawDen, d: 1 }, false);
      q.prompt = render(f) + " is equivalent to " + rawNum + "/" + "?. What is the missing denominator?";
      q.explanation = "Multiply " + f.d + " by the same factor " + k + ": " + f.d * k + ". So the missing denominator is " + rawDen + ".";
    }
    q.hint = "The denominator is scaled by " + k + ", so the numerator must be too.";
    return q;
  }

  function qIdentify(profile, rng) {
    var f = randProper(rng, { maxDen: Math.min(8, profile.maxDen), maxNum: profile.maxNum, allowNeg: false });
    var m = mcq4(render(f), [render(frac(f.n + 1, f.d)), render(frac(f.n, f.d + 1)), render(frac(f.d, f.n))], rng);
    var q = baseQuestion(profile, "identify", rng);
    q.target = { n: f.n, d: f.d };
    q.prompt = "Which fraction matches the shaded model?";
    q.options = m.options; q.answer = m.answer;
    q.explanation = "The model has " + f.d + " equal parts with " + f.n + " shaded, which is " + render(f) + ".";
    q.hint = "Count the total equal parts (denominator) and the shaded parts (numerator).";
    return q;
  }

  function qWord(profile, rng) {
    // Contextual word problems with exact answers.
    var templates = [
      { make: function (rng2) { var v = frac(ri(rng2, 1, 4), 5); return { ctx: v, d2: frac(ri(rng2, 1, 3), 5) }; }, text: "Riya ate %s of a cake and her brother ate %s. How much did they eat together?", op: "add" },
      { make: function (rng2) { return { ctx: frac(ri(rng2, 2, 3), 4), d2: frac(ri(rng2, 1, 2), 4) }; }, text: "A jug was %s full. Arjun poured out %s. What fraction is left?", op: "sub" },
      { make: function (rng2) { return { ctx: frac(ri(rng2, 1, 3), 4), d2: frac(ri(rng2, 2, 5), 1) }; }, text: "A recipe uses %s of a cup of sugar. Anvith makes the recipe %s times. How much sugar is used?", op: "mul" },
      { make: function (rng2) { var dn = ri(rng2, 2, 6); var m = ri(rng2, 1, dn - 1); return { ctx: frac(m, dn), d2: frac(1, dn) }; }, text: "A ribbon %s m long is cut into pieces of %s m each. How many pieces?", op: "div" }
    ];
    var t = pick(rng, templates);
    var parts = t.make(rng);
    var a, c, result;
    a = parts.ctx; c = parts.d2;
    if (t.op === "add") { result = add(a, c); }
    else if (t.op === "sub") { result = sub(a, c); if (result.n < 0) { var tmp = a; a = c; c = tmp; result = sub(a, c); } }
    else if (t.op === "mul") { result = mul(a, c); }
    else { result = div(a, c); }
    var q = baseNumeric(profile, "word", rng, result, false);
    q.prompt = t.text.replace("%s", render(a)).replace("%s", render(c));
    q.explanation = opExplainer(a, c, t.op, result, q) + " So " + render(result) + " is the answer.";
    q.hint = kindLabel("word") + ": decide whether you add, subtract, multiply or divide.";
    return q;
  }

  /* ------------------------------------------------------------------
   * 6. BUILDER MODE CHALLENGES
   * ---------------------------------------------------------------- */

  // Returns a challenge spec the Builder UI turns into an interactive
  // visual construction. All answers derive from validated math.
  function builderChallenge(profileId, rng) {
    var profile = profileMeta(profileId);
    var b = { maxDen: profile.maxDen, maxNum: profile.maxNum, allowNeg: profile.allowNeg };
    var types = ["construct", "represent", "simplify", "compare", "mixed", "missing"];
    var kind = profile.id === "foundation" ? pick(rng, ["construct", "represent", "missing"]) : pick(rng, types);
    var model = pick(rng, ["bar", "circle", "grid"]);

    if (kind === "construct") {
      var f = randProper(rng, { maxDen: Math.min(8, b.maxDen), maxNum: b.maxNum, allowNeg: false });
      return {
        kind: "construct", model: model,
        target: { n: f.n, d: f.d },
        answerCount: f.n,
        prompt: "Build " + render(f) + ": select " + f.n + " of the " + f.d + " equal parts.",
        hint: "The denominator " + f.d + " tells you the total equal parts; the numerator " + f.n + " tells you how many to select.",
        explanation: "You selected " + f.n + " of " + f.d + " equal parts, which represents " + render(f) + "."
      };
    }
    if (kind === "represent") {
      var base = randProper(rng, { maxDen: Math.min(8, b.maxDen), maxNum: b.maxNum, allowNeg: false });
      var k = ri(rng, 2, 4);
      var eqv = rawScale(base, k);
      var m = mcq4(renderRaw(eqv), [render(base), renderRaw(rawScale(base, k + 1)), renderRaw(rawScale(base, Math.max(2, k - 1)))], rng);
      return {
        kind: "represent", model: model,
        target: { n: base.n, d: base.d },
        options: m.options, answer: m.answer,
        prompt: render(base) + " is equivalent to which fraction shown?",
        hint: "Multiply the numerator and denominator of " + render(base) + " by the same number.",
        explanation: renderRaw(eqv) + " is " + render(base) + " scaled by " + k + ", so they are equivalent."
      };
    }
    if (kind === "simplify") {
      var gq = qSimplify(profile, rng);
      return {
        kind: "simplify", model: model, target: { n: gq.canonical ? gq.canonical.n : 0, d: 1 },
        options: gq.options, answer: gq.answer,
        prompt: gq.prompt, hint: gq.hint, explanation: gq.explanation
      };
    }
    if (kind === "compare") {
      var a = randProper(rng, { maxDen: Math.min(8, b.maxDen), maxNum: b.maxNum, allowNeg: false });
      var c = randProper(rng, { maxDen: Math.min(8, b.maxDen), maxNum: b.maxNum, allowNeg: false });
      var guard = 0;
      while (eq(a, c) && guard < 8) { c = randProper(rng, { maxDen: Math.min(8, b.maxDen), maxNum: b.maxNum, allowNeg: false }); guard++; }
      var sym = compareSymbol(a, c);
      var m2 = mcq4(sym, ["<", ">", "="], rng);
      return {
        kind: "compare", model: model, targetA: { n: a.n, d: a.d }, targetB: { n: c.n, d: c.d },
        options: m2.options, answer: m2.answer,
        prompt: "Which symbol compares " + render(a) + " and " + render(c) + "? (A = " + render(a) + ", B = " + render(c) + ")",
        hint: "Cross-multiply or use a common denominator.",
        explanation: cmp(a, c) > 0 ? render(a) + " > " + render(c) : render(a) + " < " + render(c)
      };
    }
    if (kind === "mixed") {
      var g2 = qMixed(profile, rng, true);
      return {
        kind: "mixed", model: model, target: { n: 4, d: 2 }, options: g2.options, answer: g2.answer,
        prompt: g2.prompt, hint: g2.hint, explanation: g2.explanation
      };
    }
    // missing (numeric)
    var g3 = qMissing(profile, rng);
    return {
      kind: "missing", model: model, target: { n: g3.canonical.n, d: g3.canonical.d }, type: "numeric",
      canonical: g3.canonical, prompt: g3.prompt, hint: g3.hint, explanation: g3.explanation
    };
  }

  /* ------------------------------------------------------------------
   * 7. ESCAPE ROOM (deterministic, provably solvable)
   * ---------------------------------------------------------------- */
  // Each lock has an INTEGER answer. The exit door code is the SUM of the
  // three lock answers - recomputed by the engine, never hardcoded from a
  // different puzzle. Every answer can be re-derived from its clue.
  var ROOMS = [
    { id: 1, name: "The Gate of Parts", icon: "\ud83d\udeaa", brief: "Identify the parts of the fraction gate.", skills: "identify,count" },
    { id: 2, name: "The Hall of Equivalence", icon: "\ud83e\udde9", brief: "Balance the equivalent-fraction bridges.", skills: "equiv" },
    { id: 3, name: "The Simplification Chamber", icon: "\u2699\ufe0f", brief: "Reduce each fraction to its simplest core.", skills: "simplify" },
    { id: 4, name: "The Operations Bridge", icon: "\ud83c\udf09", brief: "Compute across the bridge of operations.", skills: "add,sub,mul,div" },
    { id: 5, name: "The Final Vault", icon: "\ud83d\udec1", brief: "Solve mixed operations and context puzzles to claim the treasure.", skills: "word,mixed" }
  ];

  function escapeRoomPuzzles(roomId, rng) {
    var locks;
    if (roomId === 1) { locks = room1Locks(rng); }
    else if (roomId === 2) { locks = room2Locks(rng); }
    else if (roomId === 3) { locks = room3Locks(rng); }
    else if (roomId === 4) { locks = room4Locks(rng); }
    else { locks = room5Locks(rng); }
    var code = locks.reduce(function (s, l) { return s + l.answer; }, 0);
    return {
      room: roomMap()[roomId],
      locks: locks,
      door: {
        prompt: "The exit door needs the code: Lock A + Lock B + Lock C.",
        answer: code,
        hint: "Add the three lock answers you just found.",
        explanation: "The door code is " + locks[0].answer + " + " + locks[1].answer + " + " + locks[2].answer + " = " + code + "."
      }
    };
  }
  function roomMap() { var m = {}; for (var i = 0; i < ROOMS.length; i++) { m[ROOMS[i].id] = ROOMS[i]; } return m; }

  function room1Locks(rng) {
    var d = ri(rng, 3, 8);
    var n = ri(rng, 1, d - 1);
    return [
      { label: "Lock A", prompt: "A fraction bar is split into " + d + " equal parts. How many parts make the whole bar?", answer: d, hint: "The denominator is the number of equal parts.", explanation: "The whole bar is " + d + " equal parts, so the answer is " + d + "." },
      { label: "Lock B", prompt: "A circle is divided into 8 equal pieces and 3 are shaded. What fraction is unshaded? Type only the numerator.", answer: 8 - 3, hint: "Unshaded pieces = total minus shaded.", explanation: "8 \u2212 3 = " + (8 - 3) + " pieces are unshaded, so the numerator is " + (8 - 3) + "." },
      { label: "Lock C", prompt: "A grid has 4 rows and 3 columns. How many equal parts are there in total?", answer: 12, hint: "Multiply rows and columns.", explanation: "4 rows \u00d7 3 columns = 12 equal parts." }
    ];
  }
  function room2Locks(rng) {
    var base = frac(ri(rng, 1, 3), ri(rng, 2, 6));
    var k1 = ri(rng, 2, 4);
    var nA = base.n * k1;
    var dA = base.d * k1;
    var base2 = frac(ri(rng, 1, 4), ri(rng, 2, 8));
    var k2 = ri(rng, 2, 4);
    var nB = base2.n * k2;
    var dB = base2.d * k2;
    return [
      { label: "Lock A", prompt: "Find '?': " + render(base) + " = " + nA + "/?. Type the missing denominator.", answer: dA, hint: "What did you multiply " + base.d + " by to get " + nA + " as the numerator?", explanation: "The numerator went from " + base.n + " to " + nA + " (\u00d7 " + k1 + "), so the denominator must too: " + base.d + " \u00d7 " + k1 + " = " + dA + "." },
      { label: "Lock B", prompt: "Find '?': " + render(base) + " = ?/" + dA + ". Type the missing numerator.", answer: nA, hint: "Scale " + render(base) + " up to denominator " + dA + ".", explanation: "The denominator went from " + base.d + " to " + dA + " (\u00d7 " + k1 + "), so the numerator must too: " + base.n + " \u00d7 " + k1 + " = " + nA + "." },
      { label: "Lock C", prompt: "Find '?': " + render(base2) + " = ?/" + dB + ". Type the missing numerator.", answer: nB, hint: "The denominator was multiplied by " + k2 + ".", explanation: base2.n + " \u00d7 " + k2 + " = " + nB + ". The numerator is " + nB + "." }
    ];
  }

  function room3Locks(rng) {
    var base = frac(ri(rng, 1, 4), ri(rng, 2, 6));
    var g = ri(rng, 2, 4);
    var u = rawScale(base, g);
    var base2 = frac(ri(rng, 1, 3), ri(rng, 2, 8));
    var g2 = ri(rng, 2, 3);
    var u2 = rawScale(base2, g2);
    var base3 = frac(ri(rng, 2, 5), ri(rng, 3, 9));
    var u3 = rawScale(base3, 2);
    return [
      { label: "Lock A", prompt: "Simplify " + renderRaw(u) + ". After dividing by the GCF, what is the new numerator?", answer: base.n, hint: "What number divides both " + u.n + " and " + u.d + "?", explanation: "GCF of " + u.n + " and " + u.d + " is " + g + "; " + u.n + " \u00f7 " + g + " = " + base.n + "." },
      { label: "Lock B", prompt: "Simplify " + renderRaw(u2) + ". After simplifying, what is the denominator?", answer: base2.d, hint: "Divide both parts by their GCF.", explanation: "GCF is " + g2 + "; " + u2.d + " \u00f7 " + g2 + " = " + base2.d + "." },
      { label: "Lock C", prompt: "Simplify " + renderRaw(u3) + ". Type the numerator of the simplest form.", answer: base3.n, hint: "Both parts are even here.", explanation: "GCF is 2; " + u3.n + " \u00f7 2 = " + base3.n + "." }
    ];
  }
  function room4Locks(rng) {
    var d = ri(rng, 4, 8);
    var n1 = ri(rng, 1, d - 2);
    var n2 = ri(rng, 1, d - n1 - 1);
    var total = n1 + n2;
    var mulA = frac(ri(rng, 1, 3), 4);
    var mulN = ri(rng, 2, 4);
    var mulRes = mul(mulA, frac(mulN, 1));
    var divA = frac(ri(rng, 1, 3), 2);
    var divB = frac(1, ri(rng, 2, 4));
    var divRes = div(divA, divB);
    return [
      { label: "Lock A", prompt: render(frac(n1, d)) + " + " + render(frac(n2, d)) + " = ?/?. Type only the numerator.", answer: total, hint: "Same denominator, so add the numerators.", explanation: n1 + " + " + n2 + " = " + total + ", so the numerator is " + total + "." },
      { label: "Lock B", prompt: "Calculate " + render(mulA) + " \u00d7 " + mulN + ". Type the numerator of the answer.", answer: Math.abs(mulRes.n), hint: "Multiply the whole number as a fraction over 1.", explanation: "(" + mulA.n + " \u00d7 " + mulN + ") over " + mulA.d + " = " + render(mulRes) + ", numerator " + Math.abs(mulRes.n) + "." },
      { label: "Lock C", prompt: "Calculate " + render(divA) + " \u00f7 " + render(divB) + ". Type the numerator of the answer.", answer: Math.abs(divRes.n), hint: "Flip the second fraction and multiply.", explanation: render(divA) + " \u00d7 " + divB.d + "/" + divB.n + " = " + render(divRes) + ", numerator " + Math.abs(divRes.n) + "." }
    ];
  }
  function room5Locks(rng) {
    var w = ri(rng, 1, 3);
    var dn = ri(rng, 2, 5);
    var an = w * dn + ri(rng, 1, dn - 1);
    var imp = frac(an, dn);
    var mix = toMixed(imp);
    var pA = frac(ri(rng, 1, 3), ri(rng, 2, 5));
    var pB = frac(1, pA.d);
    var pieces = div(pA, pB);
    var sumA = frac(ri(rng, 1, 3), 6);
    var sumB = frac(ri(rng, 1, 3), 6);
    var sumRaw = sumA.n + sumB.n;
    return [
      { label: "Lock A", prompt: "Write " + render(imp) + " as a mixed number. Type the whole-number part.", answer: Math.abs(mix.whole), hint: "How many whole " + dn + "s fit inside " + an + "?", explanation: an + " \u00f7 " + dn + " = " + mix.whole + " remainder " + mix.n + ", so the whole part is " + Math.abs(mix.whole) + "." },
      { label: "Lock B", prompt: "A rope " + render(pA) + " m long is cut into pieces of " + render(pB) + " m. How many pieces?", answer: pieces.n, hint: "Divide the total by the piece size.", explanation: render(pA) + " \u00f7 " + render(pB) + " = " + render(pieces) + ", so " + pieces.n + " pieces." },
      { label: "Lock C", prompt: render(sumA) + " of a tank was filled, then another " + render(sumB) + ". What is the numerator of the full fraction?", answer: sumRaw, hint: "Same denominator \u2014 add the numerators.", explanation: sumA.n + " + " + sumB.n + " = " + sumRaw + ", so the numerator is " + sumRaw + "." }
    ];
  }
  // The `e` keys in these junk-guards are intentionally absent; see test.
  function validateEscapeRooms() {
    for (var r = 1; r <= 5; r++) {
      var data = escapeRoomPuzzles(r, seededRng(7 + r * 13));
      if (data.locks.length !== 3) { return false; }
      if (data.door.answer !== data.locks[0].answer + data.locks[1].answer + data.locks[2].answer) { return false; }
      for (var i = 0; i < 3; i++) {
        var l = data.locks[i];
        if (typeof l.answer !== "number" || l.answer < 0) { return false; }
      }
    }
    return true;
  }

  /* ------------------------------------------------------------------
   * 8. MATCHING ARENA PAIRS
   * ---------------------------------------------------------------- */

  var MATCH_TYPES = [
    { id: "equiv", label: "Equivalent fractions" },
    { id: "model", label: "Fraction and model" },
    { id: "decimal", label: "Fraction and decimal" },
    { id: "percent", label: "Fraction and percentage" },
    { id: "simplest", label: "Fraction and simplest form" },
    { id: "mixed", label: "Fraction and mixed number" }
  ];

  function matchPairs(type, count, rng) {
    var wanted = clamp(count || 4, 3, 6);
    var pairs = [];
    var seenRight = {};
    var seenLeft = {};
    var guard = 0;
    while (pairs.length < wanted && guard < 200) {
      guard++;
      var pair = makePair(type, rng);
      if (!pair) { continue; }
      var rKey = pair.right.key || pair.right.text;
      var lKey = pair.left.key || pair.left.text;
      if (seenRight[rKey] || seenLeft[lKey]) { continue; }
      seenRight[rKey] = 1; seenLeft[lKey] = 1;
      pairs.push(pair);
    }
    return pairs;
  }

  function makePair(type, rng) {
    var base = randBase(rng);
    if (type === "model") {
      return {
        left: { text: render(base), key: render(base) },
        right: { model: true, n: base.n, d: base.d, text: "model", key: render(base) }
      };
    }
    if (type === "equiv") {
      var k = ri(rng, 2, 5);
      var eqv = rawScale(base, k);
      return {
        left: { text: render(base), key: render(base) },
        right: { text: renderRaw(eqv), key: renderRaw(eqv) }
      };
    }
    if (type === "decimal") {
      if (!isTerminating(base)) { return null; }
      return {
        left: { text: render(base), key: render(base) },
        right: { text: toDecimalString(base), key: toDecimalString(base) }
      };
    }
    if (type === "percent") {
      var ps = toPercentString(base);
      if (!ps) { return null; }
      return {
        left: { text: render(base), key: render(base) },
        right: { text: ps, key: ps }
      };
    }
    if (type === "simplest") {
      var g = ri(rng, 2, 4);
      var un = rawScale(base, g);
      return {
        left: { text: renderRaw(un), key: renderRaw(un) },
        right: { text: render(base), key: render(base) }
      };
    }
    if (type === "mixed") {
      var w = ri(rng, 1, 3);
      var dn = ri(rng, 2, 6);
      var num = w * dn + ri(rng, 1, dn - 1);
      var imp = frac(num, dn);
      return {
        left: { text: render(imp), key: render(imp) },
        right: { text: renderMixed(imp), key: renderMixed(imp) }
      };
    }
    return null;
  }
  function randBase(rng) {
    var d = ri(rng, 3, 10);
    var n = ri(rng, 1, d - 1);
    var v = frac(n, d);
    // keep distinct numeric values probable by avoiding obvious repeats
    return v;
  }

  /* ------------------------------------------------------------------
   * 9. BOTS
   * ---------------------------------------------------------------- */

  var BOTS = [
    { id: "rookie", name: "Rookie Bot", icon: "\ud83e\udd16", blurb: "Friendly and steady. Knows equivalent fractions and simple simplification.", profile: "foundation", skill: 0.68, baseMs: 9000 },
    { id: "pro", name: "Pro Bot", icon: "\ud83e\udd13", blurb: "Comfortable with unlike denominators, multiplication and division.", profile: "intermediate", skill: 0.78, baseMs: 7000 },
    { id: "master", name: "Master Bot", icon: "\ud83e\uddd1\u200d\ud83d\ude80", blurb: "Handles mixed numbers and multi-step operations with ease.", profile: "advanced", skill: 0.86, baseMs: 6200 },
    { id: "boss", name: "FINAL FRACTION BOSS", icon: "\ud83d\udc0e", blurb: "A relentless mix of the hardest calculations. Defeat it to claim victory.", profile: "challenge", skill: 0.92, baseMs: 5600 }
  ];

  // Deterministic given the same rng sequence. Uses the exact generator.
  function botResolve(q, bot, rng) {
    var meta = profileMeta(bot.profile);
    var pCorrect = clamp(bot.skill - (meta.marks - 15) * 0.01, 0.2, 0.96);
    var correct = rng() < pCorrect;
    return { correct: correct, ms: bot.baseMs + Math.floor(rng() * 3000) };
  }

  /* ------------------------------------------------------------------
   * 10. SCORING, XP, LEVELS, ACHIEVEMENTS
   * ---------------------------------------------------------------- */

  // Accuracy weighted above speed; difficulty scales base points.
  function scoreAnswer(correct, marks, timeRatio, streak) {
    if (!correct) { return 0; }
    var base = marks || 15;
    var timeBonus = Math.round(base * 0.4 * clamp(1 - (timeRatio || 0), 0, 1));
    var streakBonus = Math.min(10, Math.floor((streak || 1) / 3) * 2);
    return base + timeBonus + streakBonus;
  }
  function levelThreshold(level) { return 100 * level * level; }
  function levelFromXp(xp) {
    var level = 1;
    while (xp >= levelThreshold(level) && level < 60) { level += 1; }
    var floorXp = levelThreshold(level - 1);
    var ceilXp = levelThreshold(level);
    var span = ceilXp - floorXp;
    return { level: level, into: xp - floorXp, span: span, next: ceilXp, pct: Math.round(((xp - floorXp) / span) * 100) };
  }

  var ACHIEVEMENTS = [
    { id: "first-victory", name: "First Victory", icon: "\ud83c\udfc6", desc: "Answer your first fraction question correctly.", check: function (s) { return s.correct >= 1; } },
    { id: "explorer", name: "Fraction Explorer", icon: "\ud83c\udf0d", desc: "Earn 250 XP.", check: function (s) { return s.xp >= 250; } },
    { id: "equiv-expert", name: "Equivalent Fraction Expert", icon: "\u2696\ufe0f", desc: "Get 10 equivalence questions correct.", check: function (s) { return (s.topicCorrect && s.topicCorrect.equiv >= 10); } },
    { id: "simplify-master", name: "Simplification Master", icon: "\ud83d\udcdc", desc: "Get 10 simplification questions correct.", check: function (s) { return (s.topicCorrect && s.topicCorrect.simplify >= 10); } },
    { id: "escape-artist", name: "Escape Artist", icon: "\ud83d\udd13", desc: "Escape all five Fraction Temple rooms.", check: function (s) { return s.roomsEscape >= 5; } },
    { id: "bot-slayer", name: "Bot Slayer", icon: "\ud83d\udd2b", desc: "Defeat a Fraction Bot in battle.", check: function (s) { return s.botsBeaten >= 1; } },
    { id: "boss-slayer", name: "Fraction Boss Slayer", icon: "\ud83d\udc0e", desc: "Defeat the Final Fraction Boss.", check: function (s) { return !!s.bossBeaten; } },
    { id: "blitz-champion", name: "Blitz Champion", icon: "\u26a1", desc: "Score 240 or more in a single Blitz round.", check: function (s) { return s.blitzBest >= 240; } },
    { id: "perfect-match", name: "Perfect Match", icon: "\ud83c\udfaf", desc: "Clear a Match Arena round with no mistakes.", check: function (s) { return s.matchPerfect >= 1; } },
    { id: "accuracy-ace", name: "Accuracy Ace", icon: "\ud83c\udf1f", desc: "Finish a mode with 90% accuracy (12+ questions).", check: function (s) { return s.bestAccuracy >= 0.9 && s.bestAccuracyN >= 12; } }
  ];

  function achievementStatus(stats) { return ACHIEVEMENTS.map(function (a) { return { id: a.id, name: a.name, icon: a.icon, desc: a.desc, earned: !!a.check(stats) }; }); }
  function newlyEarned(before, after) {
    var b = {}; achievementStatus(before).forEach(function (a) { if (a.earned) { b[a.id] = 1; } });
    return achievementStatus(after).filter(function (a) { return a.earned && !b[a.id]; });
  }
  function blankStats() {
    return {
      xp: 0, answered: 0, correct: 0, bestStreak: 0, bestAccuracy: 0, bestAccuracyN: 0,
      topicCorrect: {}, roomsEscape: 0, botsBeaten: 0, bossBeaten: false, blitzBest: 0,
      matchPerfect: 0, perModeBest: {}, daily: { date: null, count: 0 }, history: []
    };
  }
  function normaliseAnswer(q, submitted) {
    if (q.type === "mcq") {
      if (typeof submitted === "number") { return { ok: true, value: submitted }; }
      if (typeof submitted === "string") {
        var i = q.options.indexOf(submitted.trim());
        if (i >= 0) { return { ok: true, value: i }; }
      }
      return { ok: false, message: "Choose one of the options." };
    }
    if (typeof submitted === "number") {
      return { ok: true, value: frac(submitted, 1) };
    }
    if (submitted && typeof submitted === "object" && typeof submitted.n === "number") {
      return { ok: true, value: { n: submitted.n, d: submitted.d } };
    }
    if (typeof submitted !== "string") { return { ok: false, message: "Invalid answer." }; }
    var p = parseInput(submitted);
    if (!p.ok) { return { ok: false, message: p.message }; }
    return { ok: true, value: p.value, text: submitted };
  }

  FM.frac = frac;
  FM.gcd = gcd;
  FM.lcm = lcm;
  FM.eq = eq;
  FM.cmp = cmp;
  FM.add = add;
  FM.sub = sub;
  FM.mul = mul;
  FM.div = div;
  FM.simplify = simplify;
  FM.isReduced = isReduced;
  FM.isTerminating = isTerminating;
  FM.toMixed = toMixed;
  FM.fromMixed = fromMixed;
  FM.render = render;
  FM.renderMixed = renderMixed;
  FM.toDecimalString = toDecimalString;
  FM.toPercentString = toPercentString;
  FM.compareSymbol = compareSymbol;

  FM.seededRng = seededRng;
  FM.ri = ri;
  FM.pick = pick;
  FM.shuffle = shuffle;
  FM.clamp = clamp;

  FM.parseInput = parseInput;
  FM.checkAnswer = checkAnswer;
  FM.normaliseAnswer = normaliseAnswer;

  FM.PROFILES = PROFILES;
  FM.profileMeta = profileMeta;
  FM.KIND_META = KIND_META;
  FM.kindLabel = kindLabel;
  FM.generateQuestion = generateQuestion;
  FM.builderChallenge = builderChallenge;

  FM.ROOMS = ROOMS;
  FM.escapeRoomPuzzles = escapeRoomPuzzles;
  FM.validateEscapeRooms = validateEscapeRooms;

  FM.MATCH_TYPES = MATCH_TYPES;
  FM.matchPairs = matchPairs;

  FM.BOTS = BOTS;
  FM.botResolve = botResolve;

  FM.scoreAnswer = scoreAnswer;
  FM.levelThreshold = levelThreshold;
  FM.levelFromXp = levelFromXp;
  FM.ACHIEVEMENTS = ACHIEVEMENTS;
  FM.achievementStatus = achievementStatus;
  FM.newlyEarned = newlyEarned;
  FM.blankStats = blankStats;

  return FM;
});