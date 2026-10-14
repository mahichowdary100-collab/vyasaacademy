/* =====================================================================
 * REAL NUMBER DETECTIVE - PRIME QUEST
 * Exact number-theory engine for CBSE Class 10 Mathematics (Real Numbers)
 * ---------------------------------------------------------------------
 * Pure, dependency-free, testable module. Loads in the browser as a
 * global (window.PrimeQuest) and in Node via require() so it can be unit
 * tested with the built-in runner (node --test).
 *
 * Design notes
 *  - All integer work uses exact integer arithmetic (no floating point
 *    is used to decide equality or primality).
 *  - Rational vs irrational classification is decided from EXACT
 *    descriptors (fractions, known roots, shown repeating patterns),
 *    never from a rounded decimal approximation.
 *  - Question generation is deterministic given an injected rng() so
 *    every question can be reproduced and verified in tests.
 *  - Curriculum scope: the module tags questions as "core" (in the
 *    current CBSE Class 10 syllabus) or "enrichment" (beyond the
 *    rationalised exam scope, e.g. terminating/recurring decimal
 *    classification). Euclid's division lemma is NOT used (deleted).
 * ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else if (typeof window === "object") {
    window.PrimeQuest = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var PQ = {};
  var VERSION = "1.0.0";

  /* ---- typographic helpers (kept as escapes for encoding safety) ---- */
  var TIMES = "\u00D7";      // multiplication sign
  var SQRT = "\u221A";       // square root
  var SUP2 = "\u00B2";       // superscript two
  var SUP3 = "\u00B3";       // superscript three
  var NEQ = "\u2260";        // not equal
  var LE = "\u2264";         // less than or equal
  var GE = "\u2265";         // greater than or equal
  var SUP = { "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074", "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079" };
  var SUP_INV = (function () { var m = {}; Object.keys(SUP).forEach(function (k) { m[SUP[k]] = k; }); return m; })();

  function toSup(n) { return String(n).split("").map(function (c) { return SUP[c] || c; }).join(""); }

  var DASH = "\u2212";       // minus sign

  function neg(n) { return n < 0 ? DASH + Math.abs(n) : String(n); }

  /* ==================================================================
   * 1. INTEGER MATHEMATICS
   * ================================================================ */

  function isInt(v) { return typeof v === "number" && isFinite(v) && Math.floor(v) === v; }

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }
  function lcm(a, b) {
    if (a === 0 || b === 0) { return 0; }
    return Math.abs((a / gcd(a, b)) * b);
  }
  function gcdList(list) { return list.reduce(function (a, b) { return gcd(a, b); }); }
  function lcmList(list) { return list.reduce(function (a, b) { return lcm(a, b); }, 1); }

  function isPrime(n) {
    if (!isInt(n) || n < 2) { return false; }
    if (n % 2 === 0) { return n === 2; }
    if (n % 3 === 0) { return n === 3; }
    for (var i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) { return false; }
    }
    return true;
  }

  function isComposite(n) { return isInt(n) && n > 1 && !isPrime(n); }

  function primeFactors(n) {
    if (!isInt(n) || n < 1) { return null; }
    var out = [], m = n;
    for (var p = 2; p * p <= m; p++) {
      while (m % p === 0) { out.push(p); m /= p; }
    }
    if (m > 1) { out.push(m); }
    return out;
  }

  function factorMap(n) {
    var f = primeFactors(n);
    if (!f) { return null; }
    var m = {};
    f.forEach(function (p) { m[p] = (m[p] || 0) + 1; });
    return m;
  }
  function mapToFactorList(m) {
    var out = [];
    Object.keys(m).map(Number).sort(numAsc).forEach(function (p) {
      for (var i = 0; i < m[p]; i++) { out.push(p); }
    });
    return out;
  }
  function mapToNumber(m) {
    return Object.keys(m).reduce(function (acc, p) { return acc * Math.pow(Number(p), m[p]); }, 1);
  }
  function distinctPrimes(n) { return Object.keys(factorMap(n) || {}).map(Number).sort(numAsc); }

  function plainExponentForm(n) {
    var m = factorMap(n);
    if (!m) { return ""; }
    if (n === 1) { return "1"; }
    return Object.keys(m).map(Number).sort(numAsc).map(function (p) {
      return m[p] === 1 ? String(p) : p + "^" + m[p];
    }).join(" " + TIMES + " ");
  }
  function prettyExponentForm(n) {
    var m = factorMap(n);
    if (!m) { return ""; }
    if (n === 1) { return "1"; }
    return Object.keys(m).map(Number).sort(numAsc).map(function (p) {
      return m[p] === 1 ? String(p) : p + toSup(m[p]);
    }).join(" " + TIMES + " ");
  }
  function divisorCount(n) {
    var m = factorMap(n);
    if (!m) { return 0; }
    return Object.keys(m).reduce(function (acc, p) { return acc * (m[p] + 1); }, 1);
  }
  function properDivisors(n) {
    if (!isInt(n) || n < 2) { return []; }
    var out = [];
    for (var d = 2; d < n; d++) { if (n % d === 0) { out.push(d); } }
    return out;
  }
  function isPerfectSquare(n) {
    if (!isInt(n) || n < 0) { return false; }
    var r = Math.round(Math.sqrt(n));
    return r * r === n;
  }
  function integerSqrt(n) { return isPerfectSquare(n) ? Math.round(Math.sqrt(n)) : null; }

  /* ==================================================================
   * 2. PRIME FACTORISATION : PARSING & VALIDATION
   * ================================================================ */

  // Accepts: "2*2*2*3*3*5", "2×2×2×3×3×5", "2 2 2 3 3 5",
  //          "2,2,2,3,3,5", "2^3 × 3^2 × 5", "2³ × 3² × 5".
  function parseFactorInput(str) {
    if (str === null || str === undefined) { return { ok: false, message: "Enter your prime factors." }; }
    var s = String(str).trim();
    if (!s) { return { ok: false, message: "Enter your prime factors." }; }
    // normalise symbols
    s = s.replace(/\u00D7/g, "*").replace(/\u2715/g, "*").replace(/\u22C5/g, "*")
         .replace(/[xX]/g, "*").replace(/[,\u060C\uFF0C]/g, "*")
         .replace(/\u00B7/g, "*");
    // convert superscripts to ^n
    s = s.split("").map(function (ch) { return SUP_INV[ch] !== undefined ? "^" + SUP_INV[ch] : ch; }).join("");
    // merge "^^" artefacts (e.g. 2²³ -> 2^2^3) : rebuild sense for single-digit groups
    var tokens = s.split(/[\s*]+/).filter(function (t) { return t.length > 0; });
    if (!tokens.length) { return { ok: false, message: "Enter your prime factors." }; }
    var factors = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var m = /^(\d+)\^(\d+)(?:\^(\d+))*$/.exec(t);
      if (/^(\d+)\^(\d+)$/.test(t)) {
        var parts = t.split("^");
        var base = Number(parts[0]), exp = Number(parts[1]);
        if (base < 2 || exp < 1) { return { ok: false, message: "Use whole numbers greater than 1, e.g. 2*3 or 2^3." }; }
        for (var k = 0; k < exp; k++) { factors.push(base); }
      } else if (/^\d+$/.test(t)) {
        var v = Number(t);
        if (v < 2) { return { ok: false, message: "Use whole numbers greater than 1, e.g. 2*3 or 2^3." }; }
        factors.push(v);
      } else {
        return { ok: false, message: "Use whole numbers only, e.g. 2*2*3 or 2^3 " + TIMES + " 3." };
      }
      void m;
    }
    return { ok: true, factors: factors };
  }

  function numAsc(a, b) { return a - b; }

  // Validates that `input` is exactly the prime factorisation of n.
  // Order does not matter. Every factor must be prime and the product must be n.
  function checkFactorization(n, input) {
    if (!isInt(n) || n < 2) {
      return { ok: false, message: "This target is not factorable." };
    }
    var parsed = parseFactorInput(input);
    if (!parsed.ok) { return { ok: false, message: parsed.message, canonical: primeFactors(n) }; }
    var factors = parsed.factors;
    var product = factors.reduce(function (a, b) { return a * b; }, 1);
    if (product !== n) {
      return { ok: false, product: product, message: "The product is " + product + ", but the target is " + n + ".", canonical: primeFactors(n) };
    }
    var bad = factors.filter(function (f) { return !isPrime(f); });
    if (bad.length) {
      return { ok: false, product: product, nonPrime: bad, message: "Every factor must be prime. " + bad.join(", ") + " is not prime.", canonical: primeFactors(n) };
    }
    return { ok: true, product: product, factors: factors.slice().sort(numAsc), canonical: primeFactors(n) };
  }

  // Accepts an answer written either as a factor list ("2*2*3") or in
  // exponent form ("2^3 * 3") and checks it equals n.
  function checkExponentForm(n, input) { return checkFactorization(n, input); }

  /* ==================================================================
   * 3. HCF AND LCM
   * ================================================================ */

  function hcfByExponents(a, b) {
    var ma = factorMap(a), mb = factorMap(b), r = {};
    Object.keys(ma).forEach(function (p) {
      if (mb[p]) { r[p] = Math.min(ma[p], mb[p]); }
    });
    return r;
  }
  function lcmByExponents(a, b) {
    var ma = factorMap(a), mb = factorMap(b), r = {};
    Object.keys(ma).forEach(function (p) { r[p] = ma[p]; });
    Object.keys(mb).forEach(function (p) { r[p] = Math.max(r[p] || 0, mb[p]); });
    return r;
  }
  function exponentOf(n, p) { var m = factorMap(n); return (m && m[p]) ? m[p] : 0; }

  /* ==================================================================
   * 4. RATIONAL / IRRATIONAL CLASSIFICATION (exact descriptors only)
   * ================================================================ */

  function reduceFraction(n, d) {
    if (!isInt(n) || !isInt(d) || d === 0) { return null; }
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }

  // q in lowest terms has a terminating decimal iff its prime factors are only 2 and/or 5.
  function classifyDecimalType(n, d) {
    var r = reduceFraction(n, d);
    if (!r) { return null; }
    var fd = factorMap(r.d) || {};
    var primes = Object.keys(fd).map(Number);
    var terminating = primes.every(function (p) { return p === 2 || p === 5; });
    return {
      reduced: r,
      denomPrimes: primes,
      type: terminating ? "terminating" : "non-terminating-recurring",
      criteria: terminating
        ? "The simplified denominator " + r.d + " has only prime factors 2 and/or 5, so the decimal terminates."
        : "The simplified denominator " + r.d + " has a prime factor other than 2 or 5, so the decimal is non-terminating recurring."
    };
  }

  // Exact terminating decimal string for a fraction that terminates.
  function terminatingDecimalString(n, d) {
    var r = reduceFraction(n, d);
    if (!r) { return null; }
    var cls = classifyDecimalType(n, d);
    if (cls.type !== "terminating") { return null; }
    var num = r.n, den = r.d;
    var sign = "";
    if (num < 0) { sign = "-"; num = -num; }
    var intPart = Math.floor(num / den);
    var rem = num % den;
    if (rem === 0) { return sign + String(intPart); }
    var digits = "";
    var guard = 0;
    while (rem !== 0 && guard < 40) {
      rem *= 10;
      digits += String(Math.floor(rem / den));
      rem = rem % den;
      guard++;
    }
    return sign + String(intPart) + "." + digits;
  }

  // Classifies a structured, EXACT descriptor. Never classify from an
  // approximation: a decimal is only classified when its nature is known
  // exactly (terminating value, shown repetend, or defined pattern).
  function classifyNumber(desc) {
    if (!desc || typeof desc !== "object") { return { value: "unknown", reason: "Unsupported descriptor." }; }
    switch (desc.kind) {
      case "int":
        return { value: "rational", reason: "Every integer is rational: " + desc.label + " = " + desc.label + "/1." };
      case "fraction":
        return { value: "rational", reason: "It is already written as p/q with integers p and q (q " + NEQ + " 0)." };
      case "decimalTerm":
        return { value: "rational", reason: "A terminating decimal can be written as a fraction with denominator a power of 10." };
      case "decimalRec":
        return { value: "rational", reason: "A non-terminating but recurring decimal can always be written as a fraction p/q." };
      case "decimalIrr":
        return { value: "irrational", reason: "The decimal is non-terminating and non-repeating, so it cannot be written as p/q." };
      case "sqrt": {
        if (isPerfectSquare(desc.value)) {
          return { value: "rational", reason: SQRT + desc.value + " = " + integerSqrt(desc.value) + ", which is an integer." };
        }
        return { value: "irrational", reason: SQRT + desc.value + " is not an integer and is a classic irrational number (" + SQRT + desc.value + " is a non-terminating, non-repeating decimal)." };
      }
      case "irrSqrt":
        return { value: "irrational", reason: "The square root of a non-perfect-square natural number is irrational." };
      case "sum":
        return { value: "irrational", reason: "A rational number added to (or subtracted from) an irrational number is irrational." };
      case "product":
        return { value: "irrational", reason: "A non-zero rational times an irrational number is irrational." };
      case "pi":
        return { value: "irrational", reason: "The value " + desc.label + " is irrational." };
      case "ratioSqrts": {
        var val = reduceFraction(desc.n, desc.d);
        if (isPerfectSquare(val.n) && isPerfectSquare(val.d)) {
          return { value: "rational", reason: "The surd ratio simplifies to " + integerSqrt(val.n) + "/" + integerSqrt(val.d) + ", which is rational." };
        }
        return { value: "irrational", reason: "After simplifying the surds the ratio is not a fraction of integers, so it is irrational." };
      }
      default:
        return { value: "unknown", reason: "Unsupported descriptor." };
    }
  }

  /* ==================================================================
   * 5. PROOF DATA (proof by contradiction for sqrt(p))
   * ================================================================ */

  var PROVABLE_PRIMES = [2, 3, 5];

  function proofData(p) {
    return {
      prime: p,
      assumption: "Assume, for contradiction, that " + SQRT + p + " is rational.",
      steps: [
        "We can then write " + SQRT + p + " = a/b, where a and b are integers, b " + NEQ + " 0, and HCF(a, b) = 1 (the fraction is in lowest terms).",
        "Squaring both sides gives " + p + " = a" + SUP2 + "/b" + SUP2 + ", so a" + SUP2 + " = " + p + "b" + SUP2 + ".",
        "Since " + p + "b" + SUP2 + " is divisible by " + p + ", a" + SUP2 + " is divisible by " + p + "; as " + p + " is prime, " + p + " divides a.",
        "Write a = " + p + "k for some integer k.",
        "Substituting: (" + p + "k)" + SUP2 + " = " + p + "b" + SUP2 + ", so " + p + SUP2 + "k" + SUP2 + " = " + p + "b" + SUP2 + ", giving b" + SUP2 + " = " + p + "k" + SUP2 + ".",
        "So b" + SUP2 + " is divisible by " + p + ", hence b is divisible by " + p + ".",
        "Now a and b are both divisible by " + p + ", which contradicts HCF(a, b) = 1.",
        "This contradiction shows the assumption is false; therefore " + SQRT + p + " is irrational."
      ]
    };
  }
  function proofSteps(p) { return proofData(p).steps.slice(); }

  /* ==================================================================
   * 6. RANDOMNESS (injectable, reproducible)
   * ================================================================ */

  function seededRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* ==================================================================
   * 7. QUESTION GENERATION
   * ================================================================ */

  var DIFFICULTIES = [
    { id: "foundation", label: "Foundation" },
    { id: "application", label: "Application" },
    { id: "challenge", label: "Challenge" }
  ];

  var MODES = [
    { id: "factorization", name: "Prime Factorization Lab", icon: "\uD83E\uDDEA", scope: "core", desc: "Break numbers into prime factors with an interactive factor tree." },
    { id: "hcf-lcm", name: "HCF & LCM Mission", icon: "\uD83E\uDDED", scope: "core", desc: "Use prime factorisation to find HCF and LCM and apply them." },
    { id: "rational", name: "Rational or Irrational Detective", icon: "\uD83D\uDD0D", scope: "core", desc: "Classify integers, fractions, decimals, surds and patterns." },
    { id: "decimal", name: "Decimal Expansion Race", icon: "\uD83C\uDFC1", scope: "enrichment", desc: "Terminating or recurring? Use the 2s-and-5s rule." },
    { id: "proof", name: "Proof Arena", icon: "\uD83D\uDEE1\uFE0F", scope: "core", desc: "Build the contradiction proof that " + SQRT + "2, " + SQRT + "3, " + SQRT + "5 are irrational." },
    { id: "blitz", name: "Number Blitz", icon: "\u26A1", scope: "mixed", desc: "Five minutes, mixed concepts, accuracy beats speed." }
  ];

  var TOPICS = {
    factorization: "Prime Factorisation",
    "hcf-lcm": "HCF & LCM",
    rational: "Rational & Irrational",
    decimal: "Decimal Expansion",
    proof: "Irrationality Proofs"
  };
  function topicLabel(mode) { return TOPICS[mode] || mode; }

  var _qid = 0;
  function makeQuestion(o) {
    _qid += 1;
    var q = {
      id: "q" + _qid,
      mode: o.mode,
      difficulty: o.difficulty,
      scope: o.scope || "core",
      type: o.type,
      topic: topicLabel(o.mode),
      marks: o.marks || 10,
      prompt: o.prompt,
      explanation: o.explanation,
      hint: o.hint || ""
    };
    if (o.type === "mcq") {
      q.options = o.options.slice();
      q.answer = o.answer;
      if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.options.length) {
        throw new Error("Invalid MCQ answer index for question " + q.id);
      }
    } else {
      q.answer = o.answer;
      if (o.tolerance != null) { q.tolerance = o.tolerance; }
      if (o.unit) { q.unit = o.unit; }
    }
    if (o.data) { q.data = o.data; }
    return q;
  }

  /* ---- number pools ---- */
  var FACTOR_POOLS = {
    foundation: [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 70, 72, 75, 80, 84, 90, 96, 98, 99, 100, 105, 108],
    application: [120, 144, 150, 168, 180, 196, 200, 210, 216, 225, 240, 252, 270, 280, 288, 300, 315, 324, 330, 336, 360, 384, 396, 420],
    challenge: [504, 540, 600, 630, 660, 720, 840, 900, 945, 1000, 1008, 1155, 1260, 1320, 2310, 2520, 3003, 3600, 4096, 4620]
  };

  function factorTreeLines(n) {
    var lines = [];
    (function rec(m, depth) {
      if (isPrime(m)) { lines.push({ value: m, prime: true, depth: depth }); return; }
      var f = smallestFactor(m);
      rec(f, depth + 1);
      rec(m / f, depth + 1);
    })(n, 0);
    return lines;
  }
  function smallestFactor(m) {
    for (var d = 2; d * d <= m; d++) { if (m % d === 0) { return d; } }
    return m;
  }

  function factorizationDistractors(n, rng) {
    var base = factorMap(n);
    var primes = Object.keys(base).map(Number);
    var out = [];
    var guard = 0;
    while (out.length < 3 && guard < 200) {
      guard++;
      var copy = {};
      Object.keys(base).forEach(function (p) { copy[p] = base[p]; });
      var mode = ri(rng, 0, 2);
      if (mode === 0) {
        var p1 = pick(rng, primes);
        copy[p1] = copy[p1] + (rng() < 0.5 ? 1 : -1);
        if (copy[p1] <= 0) { copy[p1] = 1; }
      } else if (mode === 1) {
        var cand = [2, 3, 5, 7, 11, 13].filter(function (x) { return !copy[x]; });
        if (cand.length) { copy[pick(rng, cand)] = 1; }
        else { var p2 = pick(rng, primes); copy[p2] = copy[p2] + 1; }
      } else {
        if (primes.length > 1) { delete copy[pick(rng, primes)]; }
        else { copy[primes[0]] = copy[primes[0]] + 1; }
      }
      var str = mapToFormFromMap(copy);
      if (str && out.indexOf(str) === -1 && str !== prettyExponentForm(n) && str !== plainExponentForm(n)) { out.push(str); }
    }
    // Last-resort distractors: valid products of primes that differ from n.
    var extraPrimes = [2, 3, 5, 7, 11, 13].filter(function (x) { return !base[x]; });
    var gi = 0;
    while (out.length < 3 && gi < extraPrimes.length) {
      var alt = prettyExponentForm(n) + " " + TIMES + " " + extraPrimes[gi];
      if (out.indexOf(alt) === -1) { out.push(alt); }
      gi++;
    }
    while (out.length < 3) { out.push(plainExponentForm(n) + " " + TIMES + " " + (gi + 2)); gi++; }
    return out.slice(0, 3);
  }
  function mapToFormFromMap(m) {
    var keys = Object.keys(m).map(Number).sort(numAsc);
    if (!keys.length) { return ""; }
    return keys.map(function (p) { return m[p] === 1 ? String(p) : p + toSup(m[p]); }).join(" " + TIMES + " ");
  }

  function genFactorization(diff, rng) {
    var pool = FACTOR_POOLS[diff] || FACTOR_POOLS.foundation;
    var n = pick(rng, pool);
    var variant = ri(rng, 0, 4);
    if (variant === 0) {
      return makeQuestion({
        mode: "factorization", difficulty: diff, scope: "core", type: "text",
        marks: diff === "foundation" ? 10 : 15,
        prompt: "Express " + n + " as a product of prime factors (for example 2^3 " + TIMES + " 3 or 2" + SUP3 + " " + TIMES + " 3).",
        answer: primeFactors(n),
        hint: "Start by dividing by the smallest prime that goes in, and keep going until every factor is prime.",
        explanation: "The factor tree of " + n + " ends in primes only: " + prettyExponentForm(n) + ". By the Fundamental Theorem of Arithmetic this factorisation is unique up to order.",
        data: { target: n, tree: factorTreeLines(n) }
      });
    }
    if (variant === 1) {
      var m = mcq(rng, prettyExponentForm(n), factorizationDistractors(n, rng));
      return makeQuestion({
        mode: "factorization", difficulty: diff, scope: "core", type: "mcq",
        marks: 10,
        prompt: "Which is the correct prime factorisation of " + n + "?",
        options: m.options,
        answer: m.answer,
        hint: "Every factor in the answer must itself be prime.",
        explanation: n + " = " + prettyExponentForm(n) + "."
      });
    }
    if (variant === 2) {
      return makeQuestion({
        mode: "factorization", difficulty: diff, scope: "core", type: "numeric",
        marks: 10,
        prompt: "How many distinct prime factors does " + n + " have?",
        answer: distinctPrimes(n).length,
        hint: "Write the factorisation first and count the different primes.",
        explanation: n + " = " + prettyExponentForm(n) + ", so it has " + distinctPrimes(n).length + " distinct prime factors."
      });
    }
    if (variant === 3) {
      var sf = smallestFactor(n);
      return makeQuestion({
        mode: "factorization", difficulty: diff, scope: "core", type: "numeric",
        marks: 10,
        prompt: "What is the smallest prime factor of " + n + "?",
        answer: sf,
        hint: "Test the smallest primes 2, 3, 5, ... until one divides " + n + " exactly.",
        explanation: n + " = " + prettyExponentForm(n) + ", so its smallest prime factor is " + sf + "."
      });
    }
    return makeQuestion({
      mode: "factorization", difficulty: diff, scope: "core", type: "numeric",
      marks: 15,
      prompt: "Counting repetition, how many prime factors does " + n + " have? (For example 12 = 2 " + TIMES + " 2 " + TIMES + " 3 has three prime factors.)",
      answer: primeFactors(n).length,
      hint: "Write the full factorisation " + prettyExponentForm(n) + " as repeated primes and count them.",
      explanation: n + " = " + prettyExponentForm(n) + ", so counting repetition it has " + primeFactors(n).length + " prime factors."
    });
  }

  // Build a shuffled MCQ where options are [correct].concat(distractors).
  // The correct answer is placed at a random index; duplicates are removed
  // (first occurrence wins) so the answer index stays unique.
  function mcq(rng, correct, distractors) {
    var seen = {};
    var all = [];
    [correct].concat(distractors).forEach(function (o) {
      var s = String(o);
      if (!seen[s]) { seen[s] = true; all.push(o); }
    });
    var idx = shuffle(rng, all.map(function (_, i) { return i; }));
    var options = idx.map(function (i) { return all[i]; });
    return { options: options, answer: options.map(String).indexOf(String(correct)) };
  }

  /* ---- HCF / LCM ---- */
  var HCF_POOLS = {
    foundation: [[12, 18], [8, 12], [15, 25], [24, 36], [16, 24], [30, 45], [14, 21], [18, 27], [20, 30], [9, 15], [10, 15], [28, 42]],
    application: [[36, 84], [48, 72], [45, 75], [54, 90], [56, 98], [64, 80], [72, 108], [84, 126], [60, 96], [50, 125]],
    challenge: [[210, 315], [144, 216], [168, 252], [240, 360], [126, 198], [252, 420], [330, 462], [180, 270], [280, 420], [300, 450]]
  };
  var HCF_TRIPLE = {
    application: [[12, 18, 24], [15, 30, 45], [24, 36, 60], [18, 27, 45], [20, 30, 50]],
    challenge: [[36, 84, 120], [48, 72, 120], [60, 90, 150], [84, 126, 210], [120, 180, 300]]
  };

  function genHcfLcm(diff, rng) {
    // triple used in application / challenge occasionally
    if (HCF_TRIPLE[diff] && rng() < 0.25) {
      var tr = pick(rng, HCF_TRIPLE[diff]);
      var whichTr = rng() < 0.5 ? "HCF" : "LCM";
      var ansTr = whichTr === "HCF" ? gcdList(tr) : lcmList(tr);
      return makeQuestion({
        mode: "hcf-lcm", difficulty: diff, scope: "core", type: "numeric",
        marks: 15,
        prompt: "Find the " + whichTr + " of " + tr.join(", ") + ".",
        answer: ansTr,
        hint: "Write each number as a product of primes first. Use the smallest exponents for HCF and the largest for LCM.",
        explanation: "Using prime factorisation of " + tr.join(", ") + ", the " + whichTr + " is " + ansTr + "."
      });
    }
    var pair = pick(rng, HCF_POOLS[diff] || HCF_POOLS.foundation);
    var a = pair[0], b = pair[1];
    var h = gcd(a, b), l = lcm(a, b);
    var variant = ri(rng, 0, 4);
    if (variant === 0) {
      return makeQuestion({
        mode: "hcf-lcm", difficulty: diff, scope: "core", type: "numeric", marks: 10,
        prompt: "Find the HCF of " + a + " and " + b + ".",
        answer: h,
        hint: "HCF uses the smallest power of each common prime.",
        explanation: a + " = " + prettyExponentForm(a) + " and " + b + " = " + prettyExponentForm(b) + ". Their HCF is " + h + "."
      });
    }
    if (variant === 1) {
      return makeQuestion({
        mode: "hcf-lcm", difficulty: diff, scope: "core", type: "numeric", marks: 10,
        prompt: "Find the LCM of " + a + " and " + b + ".",
        answer: l,
        hint: "LCM uses the largest power of every prime that appears.",
        explanation: a + " = " + prettyExponentForm(a) + " and " + b + " = " + prettyExponentForm(b) + ". Their LCM is " + l + "."
      });
    }
    if (variant === 2) {
      var p = pick(rng, distinctPrimes(a).concat(distinctPrimes(b)).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort(numAsc));
      var which = rng() < 0.5 ? "HCF" : "LCM";
      var e = which === "HCF" ? Math.min(exponentOf(a, p), exponentOf(b, p)) : Math.max(exponentOf(a, p), exponentOf(b, p));
      return makeQuestion({
        mode: "hcf-lcm", difficulty: diff, scope: "core", type: "numeric", marks: 15,
        prompt: "For " + a + " = " + prettyExponentForm(a) + " and " + b + " = " + prettyExponentForm(b) + ", what exponent of " + p + " is used when finding the " + which + "?",
        answer: e,
        hint: which === "HCF" ? "Take the smaller exponent for HCF." : "Take the larger exponent for LCM.",
        explanation: "The " + which + " takes the " + (which === "HCF" ? "minimum" : "maximum") + " exponent, so the exponent of " + p + " is " + e + "."
      });
    }
    if (variant === 3) {
      return makeQuestion({
        mode: "hcf-lcm", difficulty: diff, scope: "core", type: "numeric", marks: 15,
        prompt: "For the two positive integers " + a + " and " + b + ", find HCF(" + a + ", " + b + ") " + TIMES + " LCM(" + a + ", " + b + ").",
        answer: a * b,
        hint: "For two numbers, HCF " + TIMES + " LCM = product of the two numbers.",
        explanation: "HCF " + TIMES + " LCM = " + h + " " + TIMES + " " + l + " = " + (a * b) + ", which equals " + a + " " + TIMES + " " + b + "."
      });
    }
    if (rng() < 0.5) {
      return makeQuestion({
        mode: "hcf-lcm", difficulty: diff, scope: "core", type: "numeric", marks: 20,
        prompt: "Two lamps blink together now. One blinks every " + a + " seconds and the other every " + b + " seconds. After how many seconds will they next blink together?",
        answer: l,
        hint: "The next common blink is the LCM of the two intervals.",
        explanation: "The lamps coincide again at LCM(" + a + ", " + b + ") = " + l + " seconds."
      });
    }
    return makeQuestion({
      mode: "hcf-lcm", difficulty: diff, scope: "core", type: "numeric", marks: 20,
      prompt: "A shopkeeper has " + a + " pens and " + b + " pencils. She wants the largest possible equal groups containing one item each, with none left over. How many items are in each group?",
      answer: h,
      hint: "The largest equal group size is the HCF of the two counts.",
      explanation: "The largest group size that divides both counts exactly is HCF(" + a + ", " + b + ") = " + h + "."
    });
  }

  /* ---- Rational / Irrational ---- */
  var RAT_POOL = {
    foundation: [
      { kind: "int", value: 7, label: "7" },
      { kind: "int", value: -3, label: DASH + "3" },
      { kind: "fraction", n: 3, d: 4, label: "3/4" },
      { kind: "decimalTerm", label: "0.75" },
      { kind: "decimalRec", label: "0.333..." },
      { kind: "sqrt", value: 4, label: SQRT + "4" },
      { kind: "sqrt", value: 9, label: SQRT + "9" },
      { kind: "sqrt", value: 2, label: SQRT + "2" },
      { kind: "sqrt", value: 3, label: SQRT + "3" }
    ],
    application: [
      { kind: "decimalRec", label: "0.272727..." },
      { kind: "sqrt", value: 25, label: SQRT + "25" },
      { kind: "sqrt", value: 5, label: SQRT + "5" },
      { kind: "sqrt", value: 7, label: SQRT + "7" },
      { kind: "sqrt", value: 18, label: SQRT + "18" },
      { kind: "sqrt", value: 50, label: SQRT + "50" },
      { kind: "pi", label: "\u03C0" },
      { kind: "decimalIrr", label: "0.1010010001..." },
      { kind: "sum", label: "2 + " + SQRT + "3" },
      { kind: "product", label: "3" + SQRT + "2" }
    ],
    challenge: [
      { kind: "sum", label: "5 " + DASH + " " + SQRT + "7" },
      { kind: "ratioSqrts", n: 48, d: 27, label: SQRT + "48 / " + SQRT + "27" },
      { kind: "ratioSqrts", n: 12, d: 75, label: SQRT + "12 / " + SQRT + "75" },
      { kind: "decimalIrr", label: "0.1234567891011..." },
      { kind: "sum", label: "1 + " + SQRT + "2" },
      { kind: "product", label: "7" + SQRT + "5" }
    ]
  };
  var RATIONAL_LABELS = ["3/4", "0.5", DASH + "6", "0.333...", SQRT + "16", "7/9", "0.125", "22/7"];
  var IRRATIONAL_LABELS = [SQRT + "2", SQRT + "3", SQRT + "5", SQRT + "7", "2 + " + SQRT + "3", "3" + SQRT + "2", "\u03C0", "0.1010010001..."];

  function genRational(diff, rng) {
    var variant = ri(rng, 0, 3);
    if (variant === 0) {
      var dsc = pick(rng, RAT_POOL[diff] || RAT_POOL.foundation);
      var cls = classifyNumber(dsc);
      var opts = ["Rational", "Irrational"];
      var ans = cls.value === "rational" ? 0 : 1;
      return makeQuestion({
        mode: "rational", difficulty: diff, scope: "core", type: "mcq", marks: 10,
        prompt: "Is " + dsc.label + " rational or irrational?",
        options: opts, answer: ans,
        hint: "Rational numbers can be written as p/q (q " + NEQ + " 0); irrational ones cannot.",
        explanation: cls.reason
      });
    }
    if (variant === 1 || variant === 2) {
      var wantRational = variant === 2;
      var poolWant = wantRational ? RATIONAL_LABELS : IRRATIONAL_LABELS;
      var poolOther = wantRational ? IRRATIONAL_LABELS : RATIONAL_LABELS;
      var correctLabel = pick(rng, poolWant);
      var distract = shuffle(rng, poolOther).slice(0, 3);
      var options = shuffle(rng, [correctLabel].concat(distract));
      return makeQuestion({
        mode: "rational", difficulty: diff, scope: "core", type: "mcq", marks: 10,
        prompt: "Which of the following is " + (wantRational ? "rational" : "irrational") + "?",
        options: options, answer: options.indexOf(correctLabel),
        hint: wantRational ? "Look for a number that can be written as p/q." : "Look for a number that cannot be written as p/q.",
        explanation: correctLabel + " is " + (wantRational ? "rational" : "irrational") + "."
      });
    }
    // misconception true/false style
    var statements = [
      { s: "Every integer is rational.", t: true, e: "Any integer n equals n/1, so it is rational." },
      { s: "Every rational number has a decimal expansion that terminates or recurs.", t: true, e: "Rationals always end, or settle into a repeating block." },
      { s: "0.1010010001... is rational because we can see a pattern.", t: false, e: "A visible pattern that never repeats is still non-repeating; this decimal is irrational." },
      { s: "The square root of every natural number is irrational.", t: false, e: SQRT + "4 = 2 and " + SQRT + "9 = 3 are rational; only non-perfect-squares give irrational roots." },
      { s: "The sum of a rational number and an irrational number is rational.", t: false, e: "It is always irrational." },
      { s: "22/7 is exactly equal to " + "\u03C0" + ".", t: false, e: "22/7 is a rational approximation of " + "\u03C0" + "; " + "\u03C0" + " is irrational." }
    ];
    var st = pick(rng, statements);
    var o2 = ["True", "False"];
    return makeQuestion({
      mode: "rational", difficulty: diff, scope: "core", type: "mcq", marks: 10,
      prompt: "True or False: " + st.s,
      options: o2, answer: st.t ? 0 : 1,
      hint: "Check whether a counterexample or a definition settles it.",
      explanation: st.e
    });
  }

  /* ---- Decimal Expansion (enrichment) ---- */
  var DEC_TERMINATING = [
    { n: 7, d: 40 }, { n: 13, d: 125 }, { n: 1, d: 8 }, { n: 3, d: 16 }, { n: 9, d: 20 },
    { n: 21, d: 50 }, { n: 3, d: 2 }, { n: 17, d: 80 }, { n: 11, d: 250 }, { n: 6, d: 25 }
  ];
  var DEC_RECURRING = [
    { n: 7, d: 12 }, { n: 11, d: 30 }, { n: 5, d: 6 }, { n: 9, d: 14 }, { n: 4, d: 21 },
    { n: 7, d: 22 }, { n: 1, d: 3 }, { n: 2, d: 7 }, { n: 5, d: 9 }, { n: 8, d: 15 }
  ];

  function genDecimal(diff, rng) {
    var variant = ri(rng, 0, 2);
    if (variant === 0 || variant === 1) {
      var fracIn = pick(rng, rng() < 0.5 ? DEC_TERMINATING : DEC_RECURRING);
      var info = classifyDecimalType(fracIn.n, fracIn.d);
      var term = info.type === "terminating";
      var opts = ["Terminating", "Non-terminating recurring"];
      var label = info.reduced.n + "/" + info.reduced.d;
      return makeQuestion({
        mode: "decimal", difficulty: diff, scope: "enrichment", type: "mcq", marks: 10,
        prompt: "The decimal expansion of " + label + " is:",
        options: opts, answer: term ? 0 : 1,
        hint: "Reduce the fraction, then look at the prime factors of the denominator. Only 2s and 5s give a terminating decimal.",
        explanation: info.criteria + (term ? " Its value is " + terminatingDecimalString(fracIn.n, fracIn.d) + "." : "")
      });
    }
    // Which fraction has a terminating decimal?
    var term2 = pick(rng, DEC_TERMINATING);
    var rec3 = shuffle(rng, DEC_RECURRING).slice(0, 3);
    var correct = term2.n + "/" + term2.d;
    var labels = shuffle(rng, [correct].concat(rec3.map(function (r) { return r.n + "/" + r.d; })));
    return makeQuestion({
      mode: "decimal", difficulty: diff, scope: "enrichment", type: "mcq", marks: 15,
      prompt: "Which of these fractions has a TERMINATING decimal expansion?",
      options: labels, answer: labels.indexOf(correct),
      hint: "The correct fraction reduces to a denominator whose only prime factors are 2 and 5.",
      explanation: correct + " reduces to " + classifyDecimalType(term2.n, term2.d).reduced.d + ", whose prime factors are only 2 and/or 5."
    });
  }

  /* ---- Proof Arena ---- */
  function genProof(diff, rng) {
    var p = pick(rng, PROVABLE_PRIMES);
    var variant = ri(rng, 0, 5);
    var data = proofData(p);
    if (variant === 0) {
      var c0 = p + " divides a" + SUP2 + ", so since " + p + " is prime, " + p + " divides a; hence a is a multiple of " + p + ".";
      var m0 = mcq(rng, c0, [
        "Therefore a = b.",
        "Therefore b is odd.",
        "Therefore a" + SUP2 + " is a perfect square so a is prime."
      ]);
      return makeQuestion({
        mode: "proof", difficulty: diff, scope: "core", type: "mcq", marks: 15,
        prompt: "In the proof that " + SQRT + p + " is irrational we assume " + SQRT + p + " = a/b with HCF(a, b) = 1, and squaring gives a" + SUP2 + " = " + p + "b" + SUP2 + ". What is the correct next step?",
        options: m0.options, answer: m0.answer,
        hint: "A prime dividing a product must divide one of the factors; apply this to a" + SUP2 + " = a " + TIMES + " a.",
        explanation: "Since " + p + " | a" + SUP2 + " = a " + TIMES + " a and " + p + " is prime, " + p + " | a. This is the key use of the Fundamental Theorem of Arithmetic."
      });
    }
    if (variant === 1) {
      var c1 = "Assume " + SQRT + p + " is rational, so " + SQRT + p + " = a/b with integers a, b, b " + NEQ + " 0, and HCF(a, b) = 1.";
      var m1 = mcq(rng, c1, [
        "Assume " + SQRT + p + " is rational, so " + SQRT + p + " = a/b where a and b share the factor " + p + ".",
        "We know " + SQRT + p + " is irrational, so let " + SQRT + p + " = a/b.",
        "Assume a and b are both prime."
      ]);
      return makeQuestion({
        mode: "proof", difficulty: diff, scope: "core", type: "mcq", marks: 15,
        prompt: "Which sentence correctly BEGINS a proof by contradiction that " + SQRT + p + " is irrational?",
        options: m1.options, answer: m1.answer,
        hint: "The contradiction will contradict coprimality, so we must start in lowest terms.",
        explanation: "We assume " + SQRT + p + " = a/b in lowest terms (HCF(a, b) = 1); the argument then shows a and b share the prime " + p + ", a contradiction."
      });
    }
    if (variant === 2) {
      var c2 = "Both a and b turn out to be divisible by " + p + ", contradicting HCF(a, b) = 1.";
      var m2 = mcq(rng, c2, [
        "a turns out to be equal to b.",
        "The fraction a/b equals " + p + ".",
        "a" + SUP2 + " = " + p + "b" + SUP2 + " has no solution."
      ]);
      return makeQuestion({
        mode: "proof", difficulty: diff, scope: "core", type: "mcq", marks: 15,
        prompt: "What is the contradiction reached in the proof that " + SQRT + p + " is irrational?",
        options: m2.options, answer: m2.answer,
        hint: "Look at what both a and b become divisible by.",
        explanation: "The steps force " + p + " | a and " + p + " | b, so a and b are not coprime, contradicting our lowest-terms assumption."
      });
    }
    if (variant === 3) {
      var c3 = "a" + SUP2 + " = " + p + "b" + SUP2 + " does not force a = " + p + " and b = 1; it only shows " + p + " divides a" + SUP2 + ".";
      var m3 = mcq(rng, c3, [
        "Nothing is wrong; this completes the proof.",
        "The step is wrong because " + SQRT + p + " is not a real number.",
        "The step is wrong because a and b must be equal."
      ]);
      return makeQuestion({
        mode: "proof", difficulty: diff, scope: "core", type: "mcq", marks: 15,
        prompt: "A student writes: \"Since a" + SUP2 + " = " + p + "b" + SUP2 + ", we get a = " + p + " and b = 1.\" What is wrong with this step?",
        options: m3.options, answer: m3.answer,
        hint: "One equation in two unknowns has many solutions.",
        explanation: "The equation only lets us conclude " + p + " | a" + SUP2 + " (and hence " + p + " | a). Assuming specific values of a and b is unjustified."
      });
    }
    if (variant === 4) {
      var c4 = "The assumption is false, so " + SQRT + p + " is irrational.";
      var m4 = mcq(rng, c4, [
        "The assumption is true, so " + SQRT + p + " is rational.",
        "a/b must equal 0.",
        "a and b must both be prime."
      ]);
      return makeQuestion({
        mode: "proof", difficulty: diff, scope: "core", type: "mcq", marks: 15,
        prompt: "Final step: the assumption that " + SQRT + p + " = a/b in lowest terms leads to a contradiction. What can we conclude?",
        options: m4.options, answer: m4.answer,
        hint: "Proof by contradiction: a false assumption means its negation is true.",
        explanation: "Because the assumption that " + SQRT + p + " is rational leads to a contradiction, " + SQRT + p + " must be irrational."
      });
    }
    // variant 5: arrange steps (order)
    var steps = data.steps.map(function (s, i) { return { i: i, text: s }; });
    var order = shuffle(rng, steps);
    var isSorted = order.every(function (s, i) { return s.i === i; });
    if (isSorted && order.length > 1) { order = order.slice(1).concat(order.slice(0, 1)); }
    return makeQuestion({
      mode: "proof", difficulty: diff, scope: "core", type: "order", marks: 20,
      prompt: "Arrange these steps in the correct logical order for the proof that " + SQRT + p + " is irrational.",
      answer: data.steps.map(function (_, i) { return i; }),
      data: { prime: p, shown: order.map(function (s) { return s.text; }), canonical: data.steps },
      hint: "Start from the assumption in lowest terms and finish with the conclusion.",
      explanation: "The correct order is: " + data.steps.map(function (s, i) { return (i + 1) + ") " + s; }).join(" ")
    });
  }

  /* ---- Blitz ---- */
  function generateQuestion(mode, diff, rng) {
    switch (mode) {
      case "factorization": return genFactorization(diff, rng);
      case "hcf-lcm": return genHcfLcm(diff, rng);
      case "rational": return genRational(diff, rng);
      case "decimal": return genDecimal(diff, rng);
      case "proof": return genProof(diff, rng);
      default: return genFactorization(diff, rng);
    }
  }

  var BLITZ_MODES = ["factorization", "hcf-lcm", "rational", "decimal", "proof"];

  function makeBlitz(count, diff, rng, opts) {
    opts = opts || {};
    var out = [];
    var seen = {};
    var guard = 0;
    var difficultyCycle = opts.mix ? ["foundation", "application", "challenge"] : [diff || "application"];
    while (out.length < count && guard < count * 40) {
      guard++;
      var mode = pick(rng, BLITZ_MODES);
      var d = opts.mix ? pick(rng, difficultyCycle) : (diff || "application");
      var q;
      try { q = generateQuestion(mode, d, rng); } catch (e) { continue; }
      var key = (q.mode === "proof") ? "proof:" + q.prompt : q.mode + ":" + q.prompt;
      if (seen[key] && !opts.allowRepeat) { continue; }
      seen[key] = true;
      out.push(q);
    }
    return out;
  }

  /* ==================================================================
   * 8. ANSWER CHECKING
   * ================================================================ */

  // Returns { ok, correct, value, message }. `q` is a question, `submitted`
  // is the raw answer (index for mcq, string for text/numeric).
  function checkAnswer(q, submitted) {
    if (!q) { return { ok: false, correct: false, message: "No question." }; }
    if (q.type === "mcq") {
      var idx = submitted;
      if (typeof idx === "string") { idx = idx.trim(); if (idx === "") { return { ok: false, correct: false, message: "Choose an option." }; } idx = Number(idx); }
      if (!isInt(idx) || idx < 0 || idx >= q.options.length) { return { ok: false, correct: false, message: "Choose one of the options." }; }
      return { ok: true, correct: idx === q.answer, value: idx };
    }
    if (q.type === "order") {
      if (!Array.isArray(submitted)) { return { ok: false, correct: false, message: "Arrange all the steps." }; }
      var okOrder = submitted.length === q.answer.length && submitted.every(function (v, i) { return v === q.answer[i]; });
      return { ok: true, correct: okOrder, value: submitted };
    }
    if (q.type === "numeric") {
      var raw = String(submitted == null ? "" : submitted).trim();
      if (!raw) { return { ok: false, correct: false, message: "Enter a number." }; }
      var num = parseNumber(raw);
      if (num === null) { return { ok: false, correct: false, message: "Enter a valid number." }; }
      var tol = q.tolerance != null ? q.tolerance : 1e-9;
      return { ok: true, correct: Math.abs(num - q.answer) <= tol, value: num };
    }
    // text -> factorization / exponent form. Compare as a prime-factorisation.
    if (q.mode === "factorization") {
      var res = checkFactorization(q.data && q.data.target ? q.data.target : q.answer.reduce(function (a, b) { return a * b; }, 1), submitted);
      return { ok: res.ok, correct: !!res.ok, value: submitted, message: res.message || "" };
    }
    var s = String(submitted == null ? "" : submitted).trim();
    if (!s) { return { ok: false, correct: false, message: "Enter an answer." }; }
    var norm = s.toLowerCase().replace(/\s+/g, "");
    var target = String(q.answer).toLowerCase().replace(/\s+/g, "");
    return { ok: true, correct: norm === target, value: s };
  }

  function parseNumber(s) {
    var t = String(s).trim().replace(/\u2212/g, "-").replace(/,/g, "");
    if (!t) { return null; }
    if (!/^-?\d*(\.\d+)?$/.test(t)) { return null; }
    var v = Number(t);
    return isFinite(v) ? v : null;
  }

  /* ==================================================================
   * 9. SCORING, LEVELS, ACHIEVEMENTS
   * ================================================================ */

  function scoreAnswer(correct, marks, timeRatio, streak) {
    marks = marks || 10;
    if (!correct) { return 0; }
    var base = marks;
    var speedBonus = Math.round(marks * clamp(timeRatio || 0, 0, 1) * 0.5);
    var streakBonus = Math.min(streak || 0, 5) * 2;
    return base + speedBonus + streakBonus;
  }

  var LEVEL_THRESHOLDS = [0, 150, 350, 600, 900, 1250, 1650, 2100, 2600, 3150, 3750];
  function levelFromXp(xp) {
    xp = Math.max(0, xp || 0);
    var lvl = 1;
    for (var i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (xp >= LEVEL_THRESHOLDS[i]) { lvl = i + 1; }
    }
    var lo = LEVEL_THRESHOLDS[lvl - 1];
    var hi = LEVEL_THRESHOLDS[lvl] != null ? LEVEL_THRESHOLDS[lvl] : (lo + 500);
    var span = hi - lo;
    var into = xp - lo;
    return { level: lvl, into: into, span: span, pct: span ? clamp(Math.round((into / span) * 100), 0, 100) : 100, next: hi };
  }

  var ACHIEVEMENTS = [
    { id: "first_factor", name: "First Factor", icon: "\uD83E\uDDEA", desc: "Answer your first question.", test: function (s) { return s.answered >= 1; } },
    { id: "factor_master", name: "Factor Master", icon: "\uD83C\uDF32", desc: "Get 10 factorisations correct.", test: function (s) { return (s.topicCorrect.factorization || 0) >= 10; } },
    { id: "tree_whisperer", name: "Tree Whisperer", icon: "\uD83C\uDF33", desc: "Complete a factor tree.", test: function (s) { return (s.factorTrees || 0) >= 1; } },
    { id: "common_ground", name: "Common Ground", icon: "\uD83E\uDDED", desc: "Get 5 HCF/LCM answers correct.", test: function (s) { return (s.topicCorrect["hcf-lcm"] || 0) >= 5; } },
    { id: "number_sorter", name: "Number Sorter", icon: "\uD83D\uDD0D", desc: "Classify 8 numbers correctly.", test: function (s) { return (s.topicCorrect.rational || 0) >= 8; } },
    { id: "decimal_diver", name: "Decimal Diver", icon: "\uD83C\uDFC1", desc: "Classify 5 decimal expansions correctly.", test: function (s) { return (s.topicCorrect.decimal || 0) >= 5; } },
    { id: "proof_pioneer", name: "Proof Pioneer", icon: "\uD83D\uDEE1\uFE0F", desc: "Complete an irrationality proof step correctly.", test: function (s) { return (s.topicCorrect.proof || 0) >= 3; } },
    { id: "streak_five", name: "On A Roll", icon: "\uD83D\uDD25", desc: "Get 5 correct in a row.", test: function (s) { return (s.bestStreak || 0) >= 5; } },
    { id: "sharp_eye", name: "Sharp Eye", icon: "\uD83C\uDFAF", desc: "Finish a session of 10+ questions with 90% accuracy.", test: function (s) { return (s.bestAccuracy || 0) >= 90 && (s.bestAccuracyN || 0) >= 10; } },
    { id: "prime_legend", name: "Prime Legend", icon: "\uD83D\uDC51", desc: "Reach Level 5.", test: function (s) { return levelFromXp(s.xp || 0).level >= 5; } },
    { id: "blitz_ace", name: "Blitz Ace", icon: "\u26A1", desc: "Score 120 or more in Number Blitz.", test: function (s) { return (s.blitzBest || 0) >= 120; } },
    { id: "detective_chief", name: "Detective Chief", icon: "\uD83C\uDFC6", desc: "Complete every game mode at least once.", test: function (s) {
      return ["factorization", "hcf-lcm", "rational", "decimal", "proof", "blitz"].every(function (m) { return (s.perModeBest[m] || 0) > 0 || (s.modesCompleted && s.modesCompleted[m]); });
    } }
  ];

  function blankStats() {
    return {
      xp: 0, answered: 0, correct: 0, bestStreak: 0, bestAccuracy: 0, bestAccuracyN: 0,
      topicCorrect: {}, factorTrees: 0, proofCorrect: 0, sessions: 0, blitzBest: 0,
      perModeBest: {}, modesCompleted: {}, daily: { date: null, count: 0 }, history: []
    };
  }

  function achievementStatus(stats) {
    return ACHIEVEMENTS.map(function (a) {
      var earned = false;
      try { earned = !!a.test(stats); } catch (e) { earned = false; }
      return { id: a.id, name: a.name, icon: a.icon, desc: a.desc, earned: earned };
    });
  }

  // Robust loading: coerce and bound every field; never throw.
  function sanitizeStats(raw) {
    var s = blankStats();
    if (!raw || typeof raw !== "object") { return s; }
    function num(v) { return (typeof v === "number" && isFinite(v) && v >= 0) ? Math.floor(v) : 0; }
    s.xp = num(raw.xp);
    s.answered = num(raw.answered);
    s.correct = Math.min(num(raw.correct), s.answered);
    s.bestStreak = num(raw.bestStreak);
    s.bestAccuracy = clamp(num(raw.bestAccuracy), 0, 100);
    s.bestAccuracyN = num(raw.bestAccuracyN);
    s.factorTrees = num(raw.factorTrees);
    s.proofCorrect = num(raw.proofCorrect);
    s.sessions = num(raw.sessions);
    s.blitzBest = num(raw.blitzBest);
    if (raw.topicCorrect && typeof raw.topicCorrect === "object") {
      Object.keys(raw.topicCorrect).forEach(function (k) { if (/^[a-z-]+$/.test(k)) { s.topicCorrect[k] = num(raw.topicCorrect[k]); } });
    }
    if (raw.perModeBest && typeof raw.perModeBest === "object") {
      Object.keys(raw.perModeBest).forEach(function (k) { if (/^[a-z-]+$/.test(k)) { s.perModeBest[k] = num(raw.perModeBest[k]); } });
    }
    if (raw.modesCompleted && typeof raw.modesCompleted === "object") {
      Object.keys(raw.modesCompleted).forEach(function (k) { if (/^[a-z-]+$/.test(k)) { s.modesCompleted[k] = !!raw.modesCompleted[k]; } });
    }
    if (raw.daily && typeof raw.daily === "object" && typeof raw.daily.date === "string") {
      s.daily = { date: raw.daily.date.slice(0, 10), count: num(raw.daily.count) };
    }
    if (Array.isArray(raw.history)) {
      s.history = raw.history.slice(0, 12).map(function (h) {
        return {
          mode: (h && typeof h.mode === "string") ? h.mode.slice(0, 24) : "",
          score: num(h && h.score), acc: clamp(num(h && h.acc), 0, 100), n: num(h && h.n), ts: num(h && h.ts)
        };
      });
    }
    return s;
  }

  /* ==================================================================
   * 10. FACTOR TREE HELPERS (for the interactive tree UI)
   * ================================================================ */

  function treeLeaves(node) {
    if (!node) { return []; }
    if (node.prime || (!node.left && !node.right)) { return [node.value]; }
    return treeLeaves(node.left).concat(treeLeaves(node.right));
  }
  function treeComplete(node) {
    if (!node) { return false; }
    if (node.prime) { return true; }
    return treeComplete(node.left) && treeComplete(node.right);
  }
  function treeProduct(node) { return treeLeaves(node).reduce(function (a, b) { return a * b; }, 1); }
  function makeNode(value) { return { value: value, prime: isPrime(value), left: null, right: null }; }

  /* ==================================================================
   * 11. SELF CHECK / VALIDATION
   * ================================================================ */

  function validate() {
    var errors = [];
    function ok(cond, msg) { if (!cond) { errors.push(msg); } }

    // factorization basics
    ok(JSON.stringify(primeFactors(1)) === "[]", "primeFactors(1) should be empty");
    ok(JSON.stringify(primeFactors(360)) === JSON.stringify([2, 2, 2, 3, 3, 5]), "primeFactors(360) wrong");
    ok(prettyExponentForm(360) === "2" + SUP3 + " " + TIMES + " 3" + SUP2 + " " + TIMES + " 5", "exponent form of 360 wrong: " + prettyExponentForm(360));
    ok(isPrime(2) && isPrime(97) && !isPrime(1) && !isPrime(91), "isPrime wrong");
    ok(gcd(12, 18) === 6 && lcm(4, 6) === 12, "gcd/lcm wrong");
    ok(gcdList([12, 18, 24]) === 6 && lcmList([12, 18, 24]) === 72, "gcdList/lcmList wrong");

    // factorization validation accepts equivalents, rejects non-primes
    ok(checkFactorization(360, "2*2*2*3*3*5").ok, "should accept 2*2*2*3*3*5 for 360");
    ok(checkFactorization(360, "3*5*2*2*2*3").ok, "should accept reordered primes for 360");
    ok(checkFactorization(360, "2^3 * 3^2 * 5").ok, "should accept exponent form for 360");
    ok(!checkFactorization(360, "4*2*45").ok, "should reject composite factors for 360");
    ok(!checkFactorization(360, "2*2*2*3*3*5*5").ok, "should reject wrong product for 360");
    ok(!checkFactorization(360, "2*2*2*3*3").ok, "should reject incomplete factorisation");

    // decimal classification
    ok(classifyDecimalType(7, 40).type === "terminating", "7/40 should terminate");
    ok(classifyDecimalType(13, 125).type === "terminating", "13/125 should terminate");
    ok(classifyDecimalType(7, 12).type === "non-terminating-recurring", "7/12 should recur");
    ok(classifyDecimalType(11, 30).type === "non-terminating-recurring", "11/30 should recur");
    ok(terminatingDecimalString(7, 40) === "0.175", "7/40 decimal value wrong: " + terminatingDecimalString(7, 40));

    // rational/irrational
    ok(classifyNumber({ kind: "int", value: 7, label: "7" }).value === "rational", "7 should be rational");
    ok(classifyNumber({ kind: "sqrt", value: 4, label: SQRT + "4" }).value === "rational", "sqrt4 should be rational");
    ok(classifyNumber({ kind: "sqrt", value: 2, label: SQRT + "2" }).value === "irrational", "sqrt2 should be irrational");
    ok(classifyNumber({ kind: "decimalRec", label: "0.333..." }).value === "rational", "0.333... should be rational");
    ok(classifyNumber({ kind: "decimalIrr", label: "0.1010010001..." }).value === "irrational", "patterned non-recurring should be irrational");

    // proofs well-formed
    PROVABLE_PRIMES.forEach(function (p) {
      var d = proofData(p);
      ok(d.steps.length >= 6, "proof for " + p + " too short");
      ok(/contradict/i.test(d.steps[d.steps.length - 2]), "proof for " + p + " missing contradiction");
      ok(/irrational/.test(d.steps[d.steps.length - 1]), "proof for " + p + " missing conclusion");
    });

    // question generation sanity for every mode and difficulty
    var rng = seededRng(2024);
    ["foundation", "application", "challenge"].forEach(function (diff) {
      ["factorization", "hcf-lcm", "rational", "decimal", "proof"].forEach(function (mode) {
        for (var i = 0; i < 8; i++) {
          var q = generateQuestion(mode, diff, rng);
          ok(q && q.prompt && q.explanation, mode + "/" + diff + " produced an incomplete question");
          if (q.type === "mcq") {
            ok(q.options.length >= 2 && q.options.length <= 4, mode + "/" + diff + " MCQ options out of range: " + q.options.length);
            ok(typeof q.answer === "number" && q.answer >= 0 && q.answer < q.options.length, mode + "/" + diff + " MCQ answer out of range");
            var uniq = {}; q.options.forEach(function (o) { uniq[String(o)] = true; });
            ok(Object.keys(uniq).length === q.options.length, mode + "/" + diff + " MCQ options not unique");
          } else if (q.type === "numeric") {
            ok(typeof q.answer === "number", mode + "/" + diff + " numeric answer not a number");
          } else if (q.type === "order") {
            ok(Array.isArray(q.answer) && q.answer.length > 1, mode + "/" + diff + " order answer malformed");
          } else if (q.type === "text") {
            ok(Array.isArray(q.answer) && q.answer.every(isPrime), mode + "/" + diff + " text answer not primes");
          }
        }
      });
    });

    // factorization MCQ answers must actually be correct/unique
    var rng2 = seededRng(77);
    for (var j = 0; j < 40; j++) {
      var fq = genFactorization("application", rng2);
      if (fq.type === "mcq") {
        var found = /factorisation of (\d+)/.exec(fq.prompt);
        ok(!!found, "could not read target from MCQ prompt: " + fq.prompt);
        if (found) {
          var target = Number(found[1]);
          var chk = checkFactorization(target, fq.options[fq.answer]);
          ok(chk.ok, "MCQ correct option failed verification: " + fq.options[fq.answer] + " for " + target);
          // every wrong option must NOT be a valid factorisation of the target
          fq.options.forEach(function (o, idx) {
            if (idx !== fq.answer) {
              var bad = checkFactorization(target, o);
              ok(!(bad.ok), "MCQ distractor is actually correct: " + o + " for " + target);
            }
          });
        }
      }
    }

    // scoring & levels
    ok(scoreAnswer(false, 10, 0.5, 3) === 0, "wrong answer must score 0");
    ok(scoreAnswer(true, 10, 0, 0) === 10, "base score wrong");
    ok(levelFromXp(0).level === 1, "level at 0 xp should be 1");
    ok(levelFromXp(3750).level >= 11, "level at 3750 xp wrong");

    // achievements + stats
    ok(ACHIEVEMENTS.length >= 10, "need at least 10 achievements");
    var st = blankStats();
    st.answered = 1;
    ok(achievementStatus(st).filter(function (a) { return a.earned; }).length >= 1, "first_factor should be earned");
    ok(sanitizeStats(null).answered === 0, "sanitize(null) should give blank stats");
    ok(sanitizeStats({ answered: 3, correct: 99 }).correct === 3, "sanitize should clamp correct to answered");

    // tree helpers
    var t = makeNode(360);
    ok(t.prime === false, "360 node should not be prime");
    ok(treeProduct(t) === 360, "tree product wrong");
    ok(!treeComplete(t), "unsplit tree should be incomplete");

    // blitz
    var b = makeBlitz(12, "application", seededRng(9), {});
    ok(b.length === 12, "makeBlitz should return requested count: " + b.length);
    var prompts = {}; b.forEach(function (q) { prompts[q.prompt] = (prompts[q.prompt] || 0) + 1; });
    ok(Object.keys(prompts).length === b.length, "blitz questions should be unique");

    return { ok: errors.length === 0, errors: errors };
  }

  /* ==================================================================
   * EXPORTS
   * ================================================================ */

  PQ.VERSION = VERSION;
  PQ.TIMES = TIMES;
  PQ.SQRT = SQRT;
  PQ.SUP2 = SUP2;
  PQ.SUP3 = SUP3;
  PQ.NEQ = NEQ;

  // integer math
  PQ.isInt = isInt;
  PQ.gcd = gcd;
  PQ.lcm = lcm;
  PQ.gcdList = gcdList;
  PQ.lcmList = lcmList;
  PQ.isPrime = isPrime;
  PQ.isComposite = isComposite;
  PQ.primeFactors = primeFactors;
  PQ.factorMap = factorMap;
  PQ.mapToFactorList = mapToFactorList;
  PQ.mapToNumber = mapToNumber;
  PQ.distinctPrimes = distinctPrimes;
  PQ.plainExponentForm = plainExponentForm;
  PQ.prettyExponentForm = prettyExponentForm;
  PQ.divisorCount = divisorCount;
  PQ.properDivisors = properDivisors;
  PQ.isPerfectSquare = isPerfectSquare;
  PQ.integerSqrt = integerSqrt;
  PQ.smallestFactor = smallestFactor;
  PQ.factorTreeLines = factorTreeLines;

  // factorization validation
  PQ.parseFactorInput = parseFactorInput;
  PQ.checkFactorization = checkFactorization;
  PQ.checkExponentForm = checkExponentForm;

  // hcf/lcm
  PQ.hcfByExponents = hcfByExponents;
  PQ.lcmByExponents = lcmByExponents;
  PQ.exponentOf = exponentOf;

  // rational / irrational
  PQ.reduceFraction = reduceFraction;
  PQ.classifyDecimalType = classifyDecimalType;
  PQ.terminatingDecimalString = terminatingDecimalString;
  PQ.classifyNumber = classifyNumber;

  // proofs
  PQ.PROVABLE_PRIMES = PROVABLE_PRIMES;
  PQ.proofData = proofData;
  PQ.proofSteps = proofSteps;

  // randomness
  PQ.seededRng = seededRng;
  PQ.ri = ri;
  PQ.pick = pick;
  PQ.shuffle = shuffle;
  PQ.clamp = clamp;

  // questions
  PQ.DIFFICULTIES = DIFFICULTIES;
  PQ.MODES = MODES;
  PQ.TOPICS = TOPICS;
  PQ.topicLabel = topicLabel;
  PQ.generateQuestion = generateQuestion;
  PQ.genFactorization = genFactorization;
  PQ.genHcfLcm = genHcfLcm;
  PQ.genRational = genRational;
  PQ.genDecimal = genDecimal;
  PQ.genProof = genProof;
  PQ.mcq = mcq;
  PQ.makeBlitz = makeBlitz;

  // answering
  PQ.checkAnswer = checkAnswer;
  PQ.parseNumber = parseNumber;

  // scoring / levels / achievements
  PQ.scoreAnswer = scoreAnswer;
  PQ.LEVEL_THRESHOLDS = LEVEL_THRESHOLDS;
  PQ.levelFromXp = levelFromXp;
  PQ.ACHIEVEMENTS = ACHIEVEMENTS;
  PQ.blankStats = blankStats;
  PQ.achievementStatus = achievementStatus;
  PQ.sanitizeStats = sanitizeStats;

  // tree
  PQ.makeNode = makeNode;
  PQ.treeLeaves = treeLeaves;
  PQ.treeComplete = treeComplete;
  PQ.treeProduct = treeProduct;

  // validation
  PQ.validate = validate;
  PQ.selfCheck = validate;

  return PQ;
});
