/* =====================================================================
 * MONEY MATHS TYCOON - financial mathematics engine
 * ---------------------------------------------------------------------
 * Pure, dependency-free, testable module. Loads in the browser as a
 * global (window.MoneyMaths) and in Node via require() so it can be
 * unit tested with the built-in test runner (node --test).
 *
 * Design notes
 *  - All monetary amounts are stored as INTEGER PAISE (1 rupee = 100
 *    paise). No unguarded binary floating point is used for money.
 *  - Percentages are plain numbers (e.g. 5 means 5%).
 *  - Rounding policy: monetary results that are not already whole paise
 *    are rounded half-up to the nearest paise at defined boundaries
 *    (interest, discounts, tax). Exact values are kept internally as
 *    integers wherever possible.
 *  - Randomness is injected as an rng() so runs are reproducible.
 *  - The simulation is a mathematical model only: no real money, no
 *    banking service, no network calls.
 * ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else if (typeof window === "object") {
    window.MoneyMaths = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var MM = {};
  MM.VERSION = "1.0.0";
  MM.SAVE_VERSION = 1;
  MM.RUPEE = "\u20B9"; // the Indian rupee sign

  /* ==================================================================
   * 1. SAFE ROUNDING + MONEY CORE (integer paise)
   * ================================================================ */

  function isFiniteNum(n) { return typeof n === "number" && isFinite(n); }

  // Round half-up to an integer (away from zero on .5).
  function roundHalfUp(x) {
    if (!isFiniteNum(x)) { return NaN; }
    return x >= 0 ? Math.floor(x + 0.5) : -Math.floor(-x + 0.5);
  }
  MM.roundHalfUp = roundHalfUp;

  function assertPaise(p) {
    if (!isFiniteNum(p) || Math.round(p) !== p) {
      throw new Error("Not an integer paise amount: " + p);
    }
    return p;
  }

  // Rupees (may be fractional) -> integer paise.
  function toPaise(rupees) {
    if (!isFiniteNum(rupees)) { return NaN; }
    return roundHalfUp(rupees * 100);
  }
  MM.toPaise = toPaise;

  function toRupees(paise) {
    return paise / 100;
  }
  MM.toRupees = toRupees;

  // Parse a monetary string to integer paise, or null if invalid.
  // Accepts optional rupee sign, spaces, Indian/Western grouping,
  // a single decimal point with up to 2 dp, and an optional sign.
  function parseMoney(input) {
    if (isFiniteNum(input)) {
      // A plain number is interpreted as rupees (matching the string path).
      return roundHalfUp(input * 100);
    }
    if (typeof input !== "string") { return null; }
    var s = input.trim();
    if (!s) { return null; }
    s = s.replace(/\u20B9|Rs\.?|INR/gi, "").trim();
    var neg = false;
    if (s.charAt(0) === "-") { neg = true; s = s.slice(1).trim(); }
    else if (s.charAt(0) === "+") { s = s.slice(1).trim(); }
    // remove grouping separators (commas and spaces)
    s = s.replace(/[,\s]/g, "");
    if (!/^\d+(\.\d{1,2})?$/.test(s)) { return null; }
    var rupees = parseFloat(s);
    if (!isFiniteNum(rupees)) { return null; }
    var paise = roundHalfUp(rupees * 100);
    return neg ? -paise : paise;
  }
  MM.parseMoney = parseMoney;

  // Group an integer string with the Indian numbering system.
  function groupIndian(digits) {
    if (digits.length <= 3) { return digits; }
    var last3 = digits.slice(-3);
    var rest = digits.slice(0, -3);
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return rest + "," + last3;
  }
  MM.groupIndian = groupIndian;

  // Format integer paise as Indian-grouped currency, e.g. Rs 1,25,000.00
  function formatMoney(paise, opts) {
    opts = opts || {};
    if (!isFiniteNum(paise)) { return MM.RUPEE + "0.00"; }
    var neg = paise < 0;
    var abs = Math.abs(Math.round(paise));
    var rupees = Math.floor(abs / 100);
    var rem = abs % 100;
    var out = groupIndian(String(rupees)) + "." + (rem < 10 ? "0" + rem : String(rem));
    if (opts.paiseOnlyFractionDigits === false) {
      out = groupIndian(String(rupees));
    }
    return (neg ? "-" : "") + MM.RUPEE + out;
  }
  MM.formatMoney = formatMoney;

  function formatRupees(paise) { return MM.RUPEE + groupIndian(String(Math.round(Math.abs(paise) / 100))); }
  MM.formatRupees = formatRupees;

  // Safe monetary arithmetic (integer paise in, integer paise out).
  function addMoney(a, b) { return assertPaise(a) + assertPaise(b); }
  function subMoney(a, b) { return assertPaise(a) - assertPaise(b); }
  function mulMoney(paise, qty) {
    if (!isFiniteNum(qty)) { throw new Error("Bad quantity"); }
    return assertPaise(paise) * qty;
  }
  MM.addMoney = addMoney;
  MM.subMoney = subMoney;
  MM.mulMoney = mulMoney;

  // A percentage of a paise amount, rounded half-up to whole paise.
  function pctOfPaise(paise, pct) {
    if (!isFiniteNum(paise) || !isFiniteNum(pct)) { return NaN; }
    return roundHalfUp(paise * pct / 100);
  }
  MM.pctOfPaise = pctOfPaise;

  /* ==================================================================
   * 2. FINANCIAL MATHEMATICS UTILITIES
   * ================================================================ */

  var fin = {};

  // Profit and loss --------------------------------------------------
  function profitLoss(costPaise, sellPaise) {
    var profit = sellPaise - costPaise;
    return {
      profit: profit,
      isProfit: profit > 0,
      isLoss: profit < 0,
      isBreakEven: profit === 0
    };
  }
  fin.profitLoss = profitLoss;

  // Profit percentage on cost price (the CBSE "profit %").
  function profitPctOnCost(costPaise, sellPaise) {
    if (!(costPaise > 0)) { return null; }
    return (sellPaise - costPaise) / costPaise * 100;
  }
  fin.profitPctOnCost = profitPctOnCost;

  function lossPctOnCost(costPaise, sellPaise) {
    if (!(costPaise > 0) || sellPaise >= costPaise) { return null; }
    return (costPaise - sellPaise) / costPaise * 100;
  }
  fin.lossPctOnCost = lossPctOnCost;

  // Markup (on cost) and margin (on revenue) are DIFFERENT numbers.
  function markupPct(costPaise, sellPaise) {
    if (!(costPaise > 0)) { return null; }
    return (sellPaise - costPaise) / costPaise * 100;
  }
  fin.markupPct = markupPct;

  function profitMarginPct(costPaise, sellPaise) {
    if (!(sellPaise > 0)) { return null; }
    return (sellPaise - costPaise) / sellPaise * 100;
  }
  fin.profitMarginPct = profitMarginPct;

  // Discounts --------------------------------------------------------
  function discountAmount(markedPaise, sellPaise) { return markedPaise - sellPaise; }
  fin.discountAmount = discountAmount;

  function discountPct(markedPaise, sellPaise) {
    if (!(markedPaise > 0)) { return null; }
    return (markedPaise - sellPaise) / markedPaise * 100;
  }
  fin.discountPct = discountPct;

  function priceAfterDiscount(markedPaise, pct) {
    return markedPaise - pctOfPaise(markedPaise, pct);
  }
  fin.priceAfterDiscount = priceAfterDiscount;

  // Successive discounts, applied one after another, rounded once.
  function successiveDiscounts(markedPaise, pcts) {
    var factor = 1;
    for (var i = 0; i < pcts.length; i++) { factor *= (1 - pcts[i] / 100); }
    return roundHalfUp(markedPaise * factor);
  }
  fin.successiveDiscounts = successiveDiscounts;

  // Price needed to reach a target profit percentage on cost.
  function priceForTargetProfitPct(costPaise, pct) {
    return roundHalfUp(costPaise * (1 + pct / 100));
  }
  fin.priceForTargetProfitPct = priceForTargetProfitPct;

  // Maximum discount percentage that still keeps selling price >= cost.
  function maxDiscountPctWithoutLoss(markedPaise, costPaise) {
    if (!(markedPaise > 0)) { return null; }
    var pct = (markedPaise - costPaise) / markedPaise * 100;
    return Math.max(0, pct);
  }
  fin.maxDiscountPctWithoutLoss = maxDiscountPctWithoutLoss;

  // Interest ---------------------------------------------------------
  // Simple interest = P * R * T / 100, T in years. Returns integer paise.
  function simpleInterest(principalPaise, ratePct, years) {
    if (!isFiniteNum(principalPaise) || !isFiniteNum(ratePct) || !isFiniteNum(years)) { return NaN; }
    return roundHalfUp(principalPaise * ratePct * years / 100);
  }
  fin.simpleInterest = simpleInterest;

  function simpleAmount(principalPaise, ratePct, years) {
    return principalPaise + simpleInterest(principalPaise, ratePct, years);
  }
  fin.simpleAmount = simpleAmount;

  // Compound amount. frequency = periods per year (1 = annual).
  // Integer periods are compounded step by step in paise so the result
  // stays exact for the common school cases (e.g. 5% for 2 years).
  function compoundAmount(principalPaise, ratePct, years, frequency) {
    var m = frequency || 1;
    if (!isFiniteNum(principalPaise) || !isFiniteNum(ratePct) || !isFiniteNum(years) || !(m > 0)) {
      return NaN;
    }
    var periods = years * m;
    var rateBp = Math.round(ratePct * 100);
    if (Math.abs(periods - Math.round(periods)) < 1e-9) {
      var n = Math.round(periods);
      var amount = principalPaise;
      for (var i = 0; i < n; i++) {
        amount = roundHalfUp(amount * (10000 * m + rateBp) / (10000 * m));
      }
      return amount;
    }
    return roundHalfUp(principalPaise * Math.pow(1 + ratePct / (100 * m), periods));
  }
  fin.compoundAmount = compoundAmount;

  function compoundInterest(principalPaise, ratePct, years, frequency) {
    return compoundAmount(principalPaise, ratePct, years, frequency) - principalPaise;
  }
  fin.compoundInterest = compoundInterest;

  // Revenue / cost / profit ------------------------------------------
  function revenue(units, unitPricePaise) { return units * unitPricePaise; }
  fin.revenue = revenue;

  function cogs(units, unitCostPaise) { return units * unitCostPaise; }
  fin.cogs = cogs;

  function grossProfit(revPaise, cogsPaise) { return revPaise - cogsPaise; }
  fin.grossProfit = grossProfit;

  function operatingProfit(revPaise, cogsPaise, opexPaise) { return revPaise - cogsPaise - opexPaise; }
  fin.operatingProfit = operatingProfit;

  function inventoryValue(inventory, catalogue) {
    var total = 0;
    for (var i = 0; i < catalogue.length; i++) {
      var p = catalogue[i];
      var qty = inventory[p.id] || 0;
      total += qty * p.costPaise;
    }
    return total;
  }
  fin.inventoryValue = inventoryValue;

  // Break-even: units to cover fixed costs at a given unit price/cost.
  function breakEvenUnits(unitPricePaise, unitCostPaise, fixedCostsPaise) {
    var contribution = unitPricePaise - unitCostPaise;
    if (!(contribution > 0)) { return null; }
    return Math.ceil(fixedCostsPaise / contribution);
  }
  fin.breakEvenUnits = breakEvenUnits;

  function budgetRemaining(allocPaise, availablePaise) { return availablePaise - allocPaise; }
  fin.budgetRemaining = budgetRemaining;

  function sumAllocation(alloc) {
    var total = 0;
    for (var k in alloc) { if (Object.prototype.hasOwnProperty.call(alloc, k)) { total += alloc[k]; } }
    return total;
  }
  fin.sumAllocation = sumAllocation;

  fin.upgradeAffordable = function (cashPaise, costPaise) { return cashPaise >= costPaise; };

  MM.financialMath = fin;
  MM.fin = fin; // short alias

  /* ==================================================================
   * 3. SEEDED RANDOMNESS
   * ================================================================ */

  // mulberry32 - small, fast, deterministic.
  function seededRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  MM.seededRng = seededRng;

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
  MM.ri = ri; MM.pick = pick; MM.shuffle = shuffle;

  function mixSeed(seed, n) {
    var h = (seed >>> 0) ^ Math.imul(n >>> 0, 2654435761);
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  MM.mixSeed = mixSeed;

  /* ==================================================================
   * 4. GAME CONFIGURATION (catalogue, upgrades, levels, expenses)
   * ================================================================ */

  var CONFIG = {
    startCashPaise: toPaise(10000), // Rs 10,000 opening balance
    savingsRatePct: 5.0,
    storageBase: 120, // base total unit capacity
    storagePerShelf: 60,
    daily: {
      rentPaise: toPaise(250),
      staffPaise: toPaise(300),
      utilitiesPaise: toPaise(120)
    },
    reputationStart: 50,
    satisfactionStart: 50
  };

  // Everyday school-shop products. cost/price in paise.
  var CATALOGUE = [
    { id: "notebook", name: "Notebook", icon: "\u270F\uFE0F", costPaise: toPaise(40), pricePaise: toPaise(55), demand: 9, category: "stationery" },
    { id: "pen", name: "Ball Pen", icon: "\uD83D\uDD8A\uFE0F", costPaise: toPaise(6), pricePaise: toPaise(10), demand: 14, category: "stationery" },
    { id: "bottle", name: "Water Bottle", icon: "\uD83E\uDDE4", costPaise: toPaise(120), pricePaise: toPaise(165), demand: 5, category: "utility" },
    { id: "geometry", name: "Geometry Box", icon: "\uD83D\uDCD0", costPaise: toPaise(90), pricePaise: toPaise(135), demand: 4, category: "stationery" },
    { id: "snack", name: "Snack Pack", icon: "\uD83C\uDF6A", costPaise: toPaise(18), pricePaise: toPaise(25), demand: 16, category: "food" },
    { id: "juice", name: "Juice Carton", icon: "\uD83E\uDDC3", costPaise: toPaise(22), pricePaise: toPaise(32), demand: 11, category: "food" },
    { id: "eraser", name: "Eraser Pack", icon: "\uD83E\uDEB6", costPaise: toPaise(10), pricePaise: toPaise(16), demand: 12, category: "stationery" },
    { id: "sharpener", name: "Sharpener", icon: "\uD83D\uDD8D\uFE0F", costPaise: toPaise(8), pricePaise: toPaise(14), demand: 10, category: "stationery" },
    { id: "tiffin", name: "Tiffin Box", icon: "\uD83C\uDF71", costPaise: toPaise(150), pricePaise: toPaise(210), demand: 3, category: "utility" },
    { id: "sketch", name: "Sketch Pen Set", icon: "\uD83C\uDFA8", costPaise: toPaise(75), pricePaise: toPaise(110), demand: 6, category: "art" }
  ];
  MM.CONFIG = CONFIG;
  MM.CATALOGUE = CATALOGUE;

  function catalogById(id) {
    for (var i = 0; i < CATALOGUE.length; i++) { if (CATALOGUE[i].id === id) { return CATALOGUE[i]; } }
    return null;
  }
  MM.catalogById = catalogById;

  // Upgrades: cost, effect (pure function on a derived value).
  var UPGRADES = [
    { id: "shelf", name: "Larger Shelves", icon: "\uD83D\uDDF3\uFE0F", costPaise: toPaise(1500), desc: "Adds 60 units of storage capacity.", effect: { type: "storage", value: 60 } },
    { id: "checkout", name: "Faster Checkout", icon: "\uD83E\uDDFE", costPaise: toPaise(2000), desc: "Serves up to 20% more customers per day.", effect: { type: "demandPct", value: 20 } },
    { id: "display", name: "Better Presentation", icon: "\uD83D\uDC8E", costPaise: toPaise(1200), desc: "Raises customer interest by 10%.", effect: { type: "demandPct", value: 10 } },
    { id: "marketing", name: "Marketing Campaign", icon: "\uD83D\uDCE3", costPaise: toPaise(2500), dailyCostPaise: toPaise(150), desc: "Boosts demand 25% but costs Rs 150 per day.", effect: { type: "demandPct", value: 25 } },
    { id: "loyalty", name: "Customer Loyalty", icon: "\uD83D\uDC9B", costPaise: toPaise(1800), desc: "Raises reputation by 15 points.", effect: { type: "reputation", value: 15 } },
    { id: "supplier", name: "Better Supplier Terms", icon: "\uD83D\uDE9A", costPaise: toPaise(3000), desc: "Reduces all purchase costs by 10%.", effect: { type: "supplierPct", value: 10 } }
  ];
  MM.UPGRADES = UPGRADES;

  function upgradeById(id) {
    for (var i = 0; i < UPGRADES.length; i++) { if (UPGRADES[i].id === id) { return UPGRADES[i]; } }
    return null;
  }
  MM.upgradeById = upgradeById;

  // Business levels with unlock conditions.
  var LEVELS = [
    { level: 1, name: "Neighbourhood Shop", icon: "\uD83C\uDFEA", minReputation: 0, minDays: 0, minProfitPaise: 0, requires: [] },
    { level: 2, name: "Improved Retail Shop", icon: "\uD83C\uDFEC", minReputation: 55, minDays: 3, minProfitPaise: toPaise(1500), requires: [] },
    { level: 3, name: "Larger Store", icon: "\uD83C\uDFED", minReputation: 65, minDays: 8, minProfitPaise: toPaise(6000), requires: ["shelf"] },
    { level: 4, name: "Mini Supermarket", icon: "\uD83C\uDFDE\uFE0F", minReputation: 75, minDays: 15, minProfitPaise: toPaise(20000), requires: ["shelf", "checkout"] },
    { level: 5, name: "Multi-location Business", icon: "\uD83C\uDFD9\uFE0F", minReputation: 85, minDays: 25, minProfitPaise: toPaise(60000), requires: ["shelf", "checkout", "supplier"] }
  ];
  MM.LEVELS = LEVELS;

  MM.levelMeta = function (level) {
    for (var i = 0; i < LEVELS.length; i++) { if (LEVELS[i].level === level) { return LEVELS[i]; } }
    return LEVELS[LEVELS.length - 1];
  };

  // XP rewards and level thresholds.
  var XP_PER_LEVEL = 250;
  MM.XP_PER_LEVEL = XP_PER_LEVEL;
  function levelFromXp(xp) {
    var level = 1 + Math.floor(xp / XP_PER_LEVEL);
    var into = xp % XP_PER_LEVEL;
    return { level: level, into: into, span: XP_PER_LEVEL, pct: (into / XP_PER_LEVEL) * 100, next: XP_PER_LEVEL - into };
  }
  MM.levelFromXp = levelFromXp;

  /* ==================================================================
   * 5. BUSINESS SIMULATION (deterministic)
   * ================================================================ */

  function blankStats() {
    return {
      questionsAnswered: 0,
      questionsCorrect: 0,
      bestStreak: 0,
      bestDailyProfitPaise: 0,
      totalProfitPaise: 0,
      budgetChallenges: 0,
      savingsChallenges: 0,
      upgradesBought: 0,
      showdownsWon: 0,
      showdownsPlayed: 0,
      interestEarnedPaise: 0,
      purchasesMade: 0,
      salesMade: 0,
      discountsGiven: 0
    };
  }
  MM.blankStats = blankStats;

  function newGame(seed, opts) {
    opts = opts || {};
    seed = (seed == null ? 12345 : seed) >>> 0;
    var inventory = {};
    var prices = {};
    CATALOGUE.forEach(function (p) {
      inventory[p.id] = opts.stockEach == null ? 5 : opts.stockEach;
      prices[p.id] = p.pricePaise;
    });
    var state = {
      version: MM.SAVE_VERSION,
      seed: seed,
      day: 1,
      cash: CONFIG.startCashPaise,
      revenue: 0,
      expenses: 0,
      cogs: 0,
      xp: 0,
      level: 1,
      reputation: CONFIG.reputationStart,
      satisfaction: CONFIG.satisfactionStart,
      inventory: inventory,
      prices: prices,
      discounts: {},
      savings: 0,
      interestEarned: 0,
      upgrades: {},
      days: [],
      ledger: [],
      txSeq: 0,
      servedToday: false,
      stats: blankStats(),
      achievements: {},
      history: []
    };
    addLedger(state, "open", "float", CONFIG.startCashPaise, "Opening balance");
    return state;
  }
  MM.newGame = newGame;

  function nextTxId(state) {
    state.txSeq += 1;
    return "tx" + state.txSeq;
  }
  MM.nextTxId = nextTxId;

  function addLedger(state, kind, category, amountPaise, note, meta) {
    var entry = {
      id: nextTxId(state),
      day: state.day,
      kind: kind,
      category: category,
      amount: amountPaise,
      note: note || "",
      ts: state.ledger.length
    };
    if (meta) { for (var k in meta) { if (Object.prototype.hasOwnProperty.call(meta, k)) { entry[k] = meta[k]; } } }
    state.ledger.push(entry);
    return entry;
  }
  MM.addLedger = addLedger;

  function storageCapacity(state) {
    var shelf = state.upgrades["shelf"] ? 1 : 0;
    var cap = CONFIG.storageBase + shelf * CONFIG.storagePerShelf;
    // Each additional business level beyond 1 adds capacity.
    cap += (Math.max(1, state.level) - 1) * 40;
    return cap;
  }
  MM.storageCapacity = storageCapacity;

  function totalStock(state) {
    var t = 0;
    for (var k in state.inventory) { if (Object.prototype.hasOwnProperty.call(state.inventory, k)) { t += state.inventory[k]; } }
    return t;
  }
  MM.totalStock = totalStock;

  function supplierCost(state, product) {
    var pct = state.upgrades["supplier"] ? 10 : 0;
    return product.costPaise - pctOfPaise(product.costPaise, pct);
  }
  MM.supplierCost = supplierCost;

  function inventoryValueOf(state) { return fin.inventoryValue(state.inventory, CATALOGUE); }
  MM.inventoryValueOf = inventoryValueOf;

  // Buy stock: cash down, inventory asset up (NOT an operating expense).
  function buyStock(state, productId, qty) {
    var product = catalogById(productId);
    if (!product) { return { ok: false, error: "Unknown product" }; }
    if (!Number.isInteger(qty) || qty <= 0) { return { ok: false, error: "Quantity must be a positive whole number" }; }
    var unitCost = supplierCost(state, product);
    var total = unitCost * qty;
    if (total > state.cash) { return { ok: false, error: "Not enough cash for this order" }; }
    if (totalStock(state) + qty > storageCapacity(state)) {
      return { ok: false, error: "Not enough storage. Upgrade shelves or buy less." };
    }
    state.cash -= total;
    state.inventory[productId] = (state.inventory[productId] || 0) + qty;
    state.stats.purchasesMade += 1;
    addLedger(state, "purchase", "inventory", -total, "Bought " + qty + " x " + product.name, { productId: productId, qty: qty, unitCost: unitCost });
    return { ok: true, unitCost: unitCost, total: total, qty: qty };
  }
  MM.buyStock = buyStock;

  function setPrice(state, productId, pricePaise) {
    if (!catalogById(productId)) { return { ok: false, error: "Unknown product" }; }
    if (!isFiniteNum(pricePaise) || pricePaise < 0) { return { ok: false, error: "Price must be zero or more" }; }
    state.prices[productId] = Math.round(pricePaise);
    return { ok: true, price: state.prices[productId] };
  }
  MM.setPrice = setPrice;

  function setDiscount(state, productId, pct) {
    if (!catalogById(productId)) { return { ok: false, error: "Unknown product" }; }
    if (!isFiniteNum(pct) || pct < 0 || pct > 90) { return { ok: false, error: "Discount must be between 0% and 90%" }; }
    state.discounts[productId] = pct;
    return { ok: true, discount: pct };
  }
  MM.setDiscount = setDiscount;

  // Effective price after any discount.
  function effectivePrice(state, productId) {
    var base = state.prices[productId];
    var d = state.discounts[productId] || 0;
    return d > 0 ? priceAfterDiscount(base, d) : base;
  }
  MM.effectivePrice = effectivePrice;

  // Deterministic per-day customer demand for one product.
  function demandFor(state, product, rng) {
    var base = product.demand;
    var price = effectivePrice(state, product.id);
    var catPrice = product.pricePaise;
    var priceFactor = price > 0 ? catPrice / price : 1.2;
    priceFactor = Math.max(0.4, Math.min(1.8, priceFactor));
    var repFactor = 0.6 + (state.reputation / 100) * 0.8;
    var satFactor = 0.6 + (state.satisfaction / 100) * 0.8;
    var demandPct = 0;
    if (state.upgrades["checkout"]) { demandPct += 20; }
    if (state.upgrades["display"]) { demandPct += 10; }
    if (state.upgrades["marketing"]) { demandPct += 25; }
    var demandMult = 1 + demandPct / 100;
    var levelMult = 1 + (Math.max(1, state.level) - 1) * 0.08;
    var raw = base * priceFactor * repFactor * satFactor * demandMult * levelMult;
    var jitter = 0.85 + rng() * 0.3; // +/-15%
    return Math.max(0, Math.round(raw * jitter));
  }
  MM.demandFor = demandFor;

  // Serve customers for the current day (idempotent per day).
  function serveCustomers(state, daySeed) {
    if (state.servedToday) { return { ok: false, error: "Customers already served today" }; }
    var rng = seededRng(daySeed == null ? mixSeed(state.seed, state.day) : daySeed);
    var sales = [];
    var totalRevenue = 0, totalCogs = 0, unitsTotal = 0;
    var soldByProduct = {};
    CATALOGUE.forEach(function (p) {
      var stock = state.inventory[p.id] || 0;
      var want = demandFor(state, p, rng);
      var units = Math.min(want, stock);
      if (units > 0) {
        var price = effectivePrice(state, p.id);
        var rev = units * price;
        var cost = units * supplierCost(state, p);
        state.cash += rev;
        state.revenue += rev;
        state.cogs += cost;
        state.inventory[p.id] = stock - units;
        unitsTotal += units;
        totalRevenue += rev;
        totalCogs += cost;
        soldByProduct[p.id] = units;
        state.stats.salesMade += 1;
        if ((state.discounts[p.id] || 0) > 0) { state.stats.discountsGiven += 1; }
        sales.push({ productId: p.id, name: p.name, units: units, unitPrice: price, revenue: rev, cogs: cost, requested: want, declined: Math.max(0, want - units) });
        addLedger(state, "sale", "revenue", rev, "Sold " + units + " x " + p.name, { productId: p.id, qty: units, unitPrice: price });
      } else if (want > 0) {
        sales.push({ productId: p.id, name: p.name, units: 0, requested: want, declined: want, outOfStock: stock === 0 });
      }
    });
    // satisfaction drifts with how well stock met demand
    var requestedTotal = sales.reduce(function (a, s) { return a + (s.requested || 0); }, 0);
    var servedRatio = requestedTotal > 0 ? unitsTotal / requestedTotal : 1;
    state.satisfaction = clamp(Math.round(state.satisfaction * 0.7 + servedRatio * 100 * 0.3), 0, 100);
    state.servedToday = true;
    return {
      ok: true,
      sales: sales,
      revenue: totalRevenue,
      cogs: totalCogs,
      grossProfit: totalRevenue - totalCogs,
      units: unitsTotal,
      bestSeller: bestSeller(soldByProduct)
    };
  }
  MM.serveCustomers = serveCustomers;

  function bestSeller(soldByProduct) {
    var best = null;
    for (var id in soldByProduct) {
      if (!best || soldByProduct[id] > soldByProduct[best]) { best = id; }
    }
    return best;
  }
  MM.bestSeller = bestSeller;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  MM.clamp = clamp;

  // Daily operating expenses (rent + staff + utilities + upgrade upkeep).
  function dailyOperatingExpense(state) {
    var total = CONFIG.daily.rentPaise + CONFIG.daily.staffPaise + CONFIG.daily.utilitiesPaise;
    for (var i = 0; i < UPGRADES.length; i++) {
      var u = UPGRADES[i];
      if (u.dailyCostPaise && state.upgrades[u.id]) { total += u.dailyCostPaise; }
    }
    return total;
  }
  MM.dailyOperatingExpense = dailyOperatingExpense;

  // Close the day: apply operating expenses, record the day, advance.
  function closeDay(state) {
    if (!state.servedToday) { return { ok: false, error: "Open the shop and serve customers before closing the day" }; }
    var opex = dailyOperatingExpense(state);
    // revenue/cogs for today are the cumulative totals minus previous days
    var prevRevenue = state.days.reduce(function (a, d) { return a + d.revenue; }, 0);
    var prevCogs = state.days.reduce(function (a, d) { return a + d.cogs; }, 0);
    var dayRevenue = state.revenue - prevRevenue;
    var dayCogs = state.cogs - prevCogs;
    state.cash -= opex;
    state.expenses += opex;
    addLedger(state, "expense", "operating", -opex, "Daily operating costs (rent, staff, utilities)");
    var gross = dayRevenue - dayCogs;
    var profit = gross - opex;
    var invValue = inventoryValueOf(state);
    var record = {
      day: state.day,
      revenue: dayRevenue,
      cogs: dayCogs,
      grossProfit: gross,
      opex: opex,
      profit: profit,
      closingCash: state.cash,
      inventoryValue: invValue,
      servedRatio: null
    };
    state.days.push(record);
    state.stats.totalProfitPaise += profit;
    if (profit > state.stats.bestDailyProfitPaise) { state.stats.bestDailyProfitPaise = profit; }
    // reputation moves toward satisfaction-based target
    var targetRep = clamp(Math.round((state.reputation * 0.8) + (state.satisfaction * 0.2)), 0, 100);
    if (profit > 0) { targetRep += 1; }
    state.reputation = clamp(targetRep, 0, 100);
    state.day += 1;
    state.servedToday = false;
    state.xp += 5; // small reward for completing a business day
    checkLevel(state);
    checkAchievements(state);
    return { ok: true, record: record };
  }
  MM.closeDay = closeDay;

  /* ------------------------------------------------------------------
   * Bank and savings (mathematical simulation only)
   * ---------------------------------------------------------------- */

  function bankDeposit(state, paise) {
    if (!isFiniteNum(paise) || paise <= 0) { return { ok: false, error: "Enter a positive amount" }; }
    paise = Math.round(paise);
    if (paise > state.cash) { return { ok: false, error: "Not enough cash to deposit" }; }
    state.cash -= paise;
    state.savings += paise;
    addLedger(state, "transfer", "savings-deposit", -paise, "Deposited to savings");
    return { ok: true, savings: state.savings };
  }
  MM.bankDeposit = bankDeposit;

  function bankWithdraw(state, paise) {
    if (!isFiniteNum(paise) || paise <= 0) { return { ok: false, error: "Enter a positive amount" }; }
    paise = Math.round(paise);
    if (paise > state.savings) { return { ok: false, error: "Not enough savings to withdraw" }; }
    state.savings -= paise;
    state.cash += paise;
    addLedger(state, "transfer", "savings-withdraw", paise, "Withdrew from savings");
    return { ok: true, savings: state.savings };
  }
  MM.bankWithdraw = bankWithdraw;

  // Apply interest on the savings balance for a number of years.
  function accrueSavings(state, ratePct, years, mode) {
    var principal = state.savings;
    var interest = mode === "compound"
      ? compoundInterest(principal, ratePct, years, 1)
      : simpleInterest(principal, ratePct, years);
    if (!isFiniteNum(interest) || interest < 0) { interest = 0; }
    state.savings += interest;
    state.interestEarned += interest;
    state.stats.interestEarnedPaise += interest;
    addLedger(state, "interest", "savings-interest", interest, mode === "compound" ? "Compound interest credited" : "Simple interest credited");
    return interest;
  }
  MM.accrueSavings = accrueSavings;

  // Projection table for the savings-growth chart.
  function savingsProjection(principalPaise, ratePct, years, mode) {
    var rows = [];
    var n = Math.max(1, Math.round(years));
    for (var y = 0; y <= n; y++) {
      var amount = mode === "compound"
        ? compoundAmount(principalPaise, ratePct, y, 1)
        : principalPaise + simpleInterest(principalPaise, ratePct, y);
      rows.push({ year: y, amount: amount, interest: amount - principalPaise });
    }
    return rows;
  }
  MM.savingsProjection = savingsProjection;

  /* ------------------------------------------------------------------
   * Upgrades and expansion
   * ---------------------------------------------------------------- */

  function buyUpgrade(state, upgradeId) {
    var u = upgradeById(upgradeId);
    if (!u) { return { ok: false, error: "Unknown upgrade" }; }
    if (state.upgrades[upgradeId]) { return { ok: false, error: "Already owned" }; }
    if (state.cash < u.costPaise) { return { ok: false, error: "Not enough cash for this upgrade" }; }
    state.cash -= u.costPaise;
    state.expenses += u.costPaise;
    state.upgrades[upgradeId] = true;
    state.stats.upgradesBought += 1;
    state.xp += 20;
    addLedger(state, "expense", "upgrade", -u.costPaise, "Upgrade: " + u.name);
    return { ok: true, upgrade: u };
  }
  MM.buyUpgrade = buyUpgrade;

  function upgradeEffectPreview(state, upgradeId) {
    var u = upgradeById(upgradeId);
    if (!u) { return null; }
    var before, after;
    if (u.effect.type === "storage") {
      before = storageCapacity(state); after = before + u.effect.value;
      return { label: "Storage capacity", before: before + " units", after: after + " units" };
    }
    if (u.effect.type === "demandPct") {
      return { label: "Customer demand", before: "current", after: "+" + u.effect.value + "%" };
    }
    if (u.effect.type === "reputation") {
      return { label: "Reputation", before: state.reputation, after: Math.min(100, state.reputation + u.effect.value) };
    }
    if (u.effect.type === "supplierPct") {
      return { label: "Purchase cost", before: "full price", after: "-" + u.effect.value + "%" };
    }
    return { label: "Effect", before: "current", after: "improved" };
  }
  MM.upgradeEffectPreview = upgradeEffectPreview;

  // Is the business allowed to advance to the next level?
  function levelUnlockStatus(state) {
    var next = null;
    for (var i = 0; i < LEVELS.length; i++) { if (LEVELS[i].level === state.level + 1) { next = LEVELS[i]; } }
    if (!next) { return { atMax: true, canUnlock: false, requirements: [] }; }
    var requirements = [
      { label: "Reputation", have: state.reputation, need: next.minReputation, met: state.reputation >= next.minReputation },
      { label: "Days completed", have: state.days.length, need: next.minDays, met: state.days.length >= next.minDays },
      { label: "Cumulative profit", have: state.stats.totalProfitPaise, need: next.minProfitPaise, met: state.stats.totalProfitPaise >= next.minProfitPaise }
    ];
    next.requires.forEach(function (rid) {
      requirements.push({ label: "Upgrade: " + (upgradeById(rid) ? upgradeById(rid).name : rid), have: state.upgrades[rid] ? "owned" : "missing", need: "owned", met: !!state.upgrades[rid] });
    });
    var canUnlock = requirements.every(function (r) { return r.met; });
    return { atMax: false, next: next, canUnlock: canUnlock, requirements: requirements };
  }
  MM.levelUnlockStatus = levelUnlockStatus;

  function unlockNextLevel(state) {
    var s = levelUnlockStatus(state);
    if (s.atMax) { return { ok: false, error: "Already at the highest level" }; }
    if (!s.canUnlock) { return { ok: false, error: "Requirements not met yet", requirements: s.requirements }; }
    state.level = s.next.level;
    state.xp += 50;
    addLedger(state, "event", "level-up", 0, "Promoted to " + s.next.name + " (Level " + s.next.level + ")");
    return { ok: true, level: state.level, name: s.next.name };
  }
  MM.unlockNextLevel = unlockNextLevel;

  function checkLevel(state) {
    var s = levelUnlockStatus(state);
    if (!s.atMax && s.canUnlock) { /* eligible - player chooses to unlock */ }
    return s;
  }
  MM.checkLevel = checkLevel;

  /* ==================================================================
   * 6. BUDGET PLANNER
   * ================================================================ */

  var BUDGET_CATEGORIES = [
    { id: "inventory", name: "Inventory purchases" },
    { id: "rent", name: "Rent" },
    { id: "staff", name: "Staff" },
    { id: "utilities", name: "Electricity & utilities" },
    { id: "marketing", name: "Marketing" },
    { id: "reserve", name: "Emergency reserve" },
    { id: "other", name: "Other" }
  ];
  MM.BUDGET_CATEGORIES = BUDGET_CATEGORIES;

  // Validate a budget plan: allocations must be non-negative integers and
  // must not exceed the opening cash (reserve included).
  function validateBudget(plan) {
    var errors = [];
    var total = 0;
    BUDGET_CATEGORIES.forEach(function (c) {
      var v = plan[c.id] == null ? 0 : plan[c.id];
      if (!isFiniteNum(v) || Math.round(v) !== v || v < 0) { errors.push(c.name + " must be a non-negative whole amount"); }
      else { total += v; }
    });
    return { totalPaise: total, errors: errors, valid: errors.length === 0 };
  }
  MM.validateBudget = validateBudget;

  function budgetAnalysis(plan, openingPaise, expectedRevenuePaise) {
    var v = validateBudget(plan);
    var remaining = openingPaise - v.totalPaise;
    var plannedProfit = (expectedRevenuePaise || 0) - v.totalPaise;
    return {
      totalPaise: v.totalPaise,
      remainingPaise: remaining,
      plannedProfitPaise: plannedProfit,
      overBudget: remaining < 0,
      reserveKeptPaise: plan.reserve || 0,
      valid: v.valid,
      errors: v.errors
    };
  }
  MM.budgetAnalysis = budgetAnalysis;

  /* ==================================================================
   * 7. FINANCIAL REPORTS (derived from the transaction ledger)
   * ================================================================ */

  function reportFromLedger(state) {
    var r = {
      revenue: 0, cogs: 0, opex: 0, inventoryPurchases: 0, savingsInterest: 0,
      upgrades: 0, units: 0, sales: 0
    };
    state.ledger.forEach(function (e) {
      if (e.kind === "sale") { r.revenue += e.amount; r.units += (e.qty || 0); r.sales += 1; }
      else if (e.category === "cogs") { r.cogs += -e.amount; }
      else if (e.kind === "purchase") { r.inventoryPurchases += -e.amount; }
      else if (e.kind === "expense" && e.category === "operating") { r.opex += -e.amount; }
      else if (e.kind === "expense" && e.category === "upgrade") { r.upgrades += -e.amount; }
      else if (e.kind === "interest") { r.savingsInterest += e.amount; }
    });
    return r;
  }
  MM.reportFromLedger = reportFromLedger;

  function buildReport(state) {
    var l = reportFromLedger(state);
    var gross = l.revenue - state.cogs;
    var operating = gross - l.opex;
    var best = "None yet";
    var unitsById = {};
    state.ledger.forEach(function (e) { if (e.kind === "sale" && e.productId) { unitsById[e.productId] = (unitsById[e.productId] || 0) + (e.qty || 0); } });
    var bestId = bestSeller(unitsById);
    if (bestId) { var p = catalogById(bestId); best = p ? p.name : bestId; }
    return {
      revenue: l.revenue,
      cogs: state.cogs,
      grossProfit: gross,
      operatingExpenses: l.opex,
      operatingProfit: operating,
      closingCash: state.cash,
      inventoryValue: inventoryValueOf(state),
      unitsSold: l.units,
      bestSeller: best,
      savings: state.savings,
      interestEarned: state.interestEarned,
      upgradesSpend: l.upgrades,
      days: state.days.length,
      totalProfit: state.stats.totalProfitPaise
    };
  }
  MM.buildReport = buildReport;

  function chartData(state) {
    return state.days.map(function (d) {
      return { day: d.day, revenue: d.revenue, expenses: d.opex + d.cogs, profit: d.profit };
    });
  }
  MM.chartData = chartData;

  /* ==================================================================
   * 8. QUESTION GENERATION
   * ================================================================ */

  var TOPICS = [
    "money", "percent", "discount", "profitloss", "budget",
    "simpleInterest", "compoundInterest", "successive",
    "markupMargin", "breakeven", "revenueExpense"
  ];
  MM.TOPICS = TOPICS;

  MM.topicLabel = function (t) {
    var m = {
      money: "Money arithmetic", percent: "Percentages", discount: "Discounts",
      profitloss: "Profit & loss", budget: "Budgeting", simpleInterest: "Simple interest",
      compoundInterest: "Compound interest", successive: "Successive discounts",
      markupMargin: "Markup & margin", breakeven: "Break-even", revenueExpense: "Revenue & expenses"
    };
    return m[t] || t;
  };

  var qSeq = 0;
  function qid(topic, diff, rng) { qSeq += 1; return topic + "-" + diff + "-" + qSeq; }
  MM._resetQSeq = function () { qSeq = 0; };

  function moneyQ(diff, rng) {
    var a = ri(rng, 20, 60) * 5, b = ri(rng, 20, 60) * 5;
    if (diff >= 2) { a = ri(rng, 100, 900); }
    var c = diff >= 2 ? ri(rng, 50, 400) : ri(rng, 10, 90);
    var ans = a + b - c;
    return {
      topic: "money", difficulty: diff, type: "number",
      prompt: "A shop earns " + formatMoney(toPaise(a)) + " in the morning and " + formatMoney(toPaise(b)) +
        " in the afternoon, then spends " + formatMoney(toPaise(c)) + " on supplies. How much money is left? (answer in rupees)",
      answerNumber: ans, unit: "rupees", marks: diff * 10, hint: "Add the earnings, then subtract the spending.",
      explanation: formatMoney(toPaise(a)) + " + " + formatMoney(toPaise(b)) + " = " + formatMoney(toPaise(a + b)) +
        ", then minus " + formatMoney(toPaise(c)) + " = " + formatMoney(toPaise(ans)) + "."
    };
  }

  function percentQ(diff, rng) {
    var bases = [200, 400, 500, 800, 1000, 1200, 1500, 2500, 5000];
    var base = pick(rng, bases);
    var pcts = diff >= 3 ? [12.5, 15, 22.5, 35] : diff >= 2 ? [15, 20, 25, 40] : [10, 20, 25, 50];
    var pct = pick(rng, pcts);
    var ans = roundHalfUp(base * pct / 100);
    return {
      topic: "percent", difficulty: diff, type: "number",
      prompt: "What is " + pct + "% of " + formatMoney(toPaise(base)) + "? (answer in rupees)",
      answerNumber: ans, unit: "rupees", marks: diff * 10, hint: "Multiply by the percent and divide by 100.",
      explanation: pct + "% of " + formatMoney(toPaise(base)) + " = " + base + " \u00D7 " + pct + " \u00F7 100 = " + formatMoney(toPaise(ans)) + "."
    };
  }

  function discountQ(diff, rng) {
    var marked = pick(rng, [500, 800, 1000, 1200, 1500, 2000]);
    var pct = pick(rng, diff >= 3 ? [12, 18, 24] : diff >= 2 ? [10, 15, 20, 25] : [10, 20, 25, 50]);
    var sell = priceAfterDiscount(toPaise(marked), pct);
    if (diff >= 3) {
      var extra = pick(rng, [5, 10, 15]);
      var sell2 = successiveDiscounts(toPaise(marked), [pct, extra]);
      return {
        topic: "successive", difficulty: diff, type: "number",
        prompt: "A shirt marked " + formatMoney(toPaise(marked)) + " gets " + pct + "% off, then a further " + extra + "% off at the counter. What is the final price? (answer in rupees)",
        answerNumber: toRupees(sell2), unit: "rupees", marks: diff * 10,
        hint: "Apply the discounts one after another, not added together.",
        explanation: "First " + pct + "% off leaves " + formatMoney(priceAfterDiscount(toPaise(marked), pct)) + ", then " + extra + "% off gives " + formatMoney(sell2) + "."
      };
    }
    return {
      topic: "discount", difficulty: diff, type: "number",
      prompt: "A bag costs " + formatMoney(toPaise(marked)) + ". It is sold with a " + pct + "% discount. What is the selling price? (answer in rupees)",
      answerNumber: toRupees(sell), unit: "rupees", marks: diff * 10,
      hint: "Discount = percent of marked price; subtract it from the marked price.",
      explanation: "Discount = " + pct + "% of " + formatMoney(toPaise(marked)) + " = " + formatMoney(pctOfPaise(toPaise(marked), pct)) +
        ", so selling price = " + formatMoney(sell) + "."
    };
  }

  function profitLossQ(diff, rng) {
    var cost = pick(rng, [40, 50, 60, 80, 100, 120, 150, 200, 250]);
    var pct = diff >= 3 ? pick(rng, [12.5, 15, 20, 25]) : pick(rng, [10, 20, 25, 30]);
    var sell = roundHalfUp(cost * (1 + pct / 100));
    return {
      topic: "profitloss", difficulty: diff, type: "number",
      prompt: "An item is bought for " + formatMoney(toPaise(cost)) + " and sold for " + formatMoney(toPaise(sell)) +
        ". What is the profit percent on cost? (answer in %, e.g. 25)",
      answerNumber: roundHalfUp(((sell - cost) / cost) * 100 * 100) / 100, unit: "%", marks: diff * 10,
      hint: "Profit percent = (Selling price - Cost price) / Cost price x 100.",
      explanation: "Profit = " + formatMoney(toPaise(sell - cost)) + ". Profit % = (" + sell + " \u2212 " + cost + ") \u00F7 " + cost + " \u00D7 100 = " + (((sell - cost) / cost) * 100).toFixed(2) + "%."
    };
  }

  function simpleInterestQ(diff, rng) {
    var p = pick(rng, [2000, 5000, 8000, 10000, 12000]);
    var r = pick(rng, diff >= 2 ? [4, 5, 6, 7.5, 9] : [4, 5, 10]);
    var t = pick(rng, diff >= 2 ? [2, 3, 4, 5] : [1, 2, 3]);
    var interest = simpleInterest(toPaise(p), r, t);
    return {
      topic: "simpleInterest", difficulty: diff, type: "number",
      prompt: formatMoney(toPaise(p)) + " is saved at " + r + "% simple interest per year for " + t + " years. What is the simple interest earned? (answer in rupees)",
      answerNumber: toRupees(interest), unit: "rupees", marks: diff * 10,
      hint: "Simple interest = P x R x T / 100.",
      explanation: "SI = " + p + " \u00D7 " + r + " \u00D7 " + t + " \u00F7 100 = " + formatMoney(interest) + "."
    };
  }

  function compoundInterestQ(diff, rng) {
    var p = pick(rng, [1000, 2000, 5000, 8000, 10000]);
    var r = pick(rng, diff >= 3 ? [8, 10, 12] : [5, 6, 10]);
    var t = pick(rng, diff >= 2 ? [2, 3] : [2]);
    var amount = compoundAmount(toPaise(p), r, t, 1);
    return {
      topic: "compoundInterest", difficulty: diff, type: "number",
      prompt: formatMoney(toPaise(p)) + " grows at " + r + "% compound interest per year. What is the amount after " + t + " years? (answer in rupees)",
      answerNumber: toRupees(amount), unit: "rupees", marks: diff * 12,
      hint: "Amount = P x (1 + R/100)^T, compounded once per year.",
      explanation: "Amount = " + p + " \u00D7 (1 + " + r + "/100)^" + t + " = " + formatMoney(amount) + "."
    };
  }

  function budgetQ(diff, rng) {
    var income = pick(rng, [5000, 8000, 10000, 12000]);
    var rent = pick(rng, [1200, 1500, 2000]);
    var stock = pick(rng, [1800, 2500, 3000]);
    var reserve = pick(rng, [500, 800, 1000]);
    var left = income - rent - stock - reserve;
    return {
      topic: "budget", difficulty: diff, type: "number",
      prompt: "Monthly income is " + formatMoney(toPaise(income)) + ". Rent is " + formatMoney(toPaise(rent)) +
        ", stock is " + formatMoney(toPaise(stock)) + " and reserve is " + formatMoney(toPaise(reserve)) +
        ". How much is left to spend? (answer in rupees)",
      answerNumber: left, unit: "rupees", marks: diff * 10,
      hint: "Subtract every planned expense from the income.",
      explanation: income + " \u2212 " + rent + " \u2212 " + stock + " \u2212 " + reserve + " = " + left + " rupees left."
    };
  }

  function markupMarginQ(diff, rng) {
    var cost = pick(rng, [80, 100, 120, 200, 250, 400]);
    var sell = roundHalfUp(cost * pick(rng, [1.2, 1.25, 1.4, 1.5]));
    var margin = roundHalfUp(((sell - cost) / sell) * 100 * 100) / 100;
    return {
      topic: "markupMargin", difficulty: Math.max(2, diff), type: "number",
      prompt: "An item costs " + formatMoney(toPaise(cost)) + " and sells for " + formatMoney(toPaise(sell)) +
        ". What is the profit margin on the selling price? (answer in %, e.g. 20)",
      answerNumber: margin, unit: "%", marks: diff * 12,
      hint: "Margin uses the selling price as the base: (Sell \u2212 Cost) \u00F7 Sell \u00D7 100.",
      explanation: "Margin = (" + sell + " \u2212 " + cost + ") \u00F7 " + sell + " \u00D7 100 = " + margin + "%. (Markup on cost would be different.)"
    };
  }

  function breakevenQ(diff, rng) {
    var price = pick(rng, [50, 60, 80, 100, 120]);
    var cost = price - pick(rng, [10, 15, 20, 25, 30]);
    var fixed = pick(rng, [600, 900, 1200, 1500, 2000]);
    var units = breakEvenUnits(toPaise(price), toPaise(cost), toPaise(fixed));
    return {
      topic: "breakeven", difficulty: Math.max(2, diff), type: "number",
      prompt: "An item sells for " + formatMoney(toPaise(price)) + " and costs " + formatMoney(toPaise(cost)) +
        " each. Fixed costs are " + formatMoney(toPaise(fixed)) + ". How many units must be sold to break even?",
      answerNumber: units, unit: "units", marks: diff * 12,
      hint: "Contribution per unit = price \u2212 cost. Break-even = fixed costs \u00F7 contribution (round up).",
      explanation: "Contribution = " + (price - cost) + " rupees. Break-even = " + fixed + " \u00F7 " + (price - cost) + " \u2248 " + units + " units."
    };
  }

  function revenueExpenseQ(diff, rng) {
    var units = ri(rng, 10, 40);
    var price = pick(rng, [20, 25, 40, 50, 80]);
    var unitCost = Math.max(5, price - pick(rng, [5, 10, 15, 20]));
    var opex = pick(rng, [100, 150, 200, 300]);
    var rev = units * price;
    var cost = units * unitCost;
    var profit = rev - cost - opex;
    return {
      topic: "revenueExpense", difficulty: diff, type: "number",
      prompt: "A shop sells " + units + " items at " + formatMoney(toPaise(price)) + " each. Each item costs " + formatMoney(toPaise(unitCost)) +
        " and daily expenses are " + formatMoney(toPaise(opex)) + ". What is the operating profit? (answer in rupees)",
      answerNumber: profit, unit: "rupees", marks: diff * 10,
      hint: "Revenue = units x price. Cost = units x unit cost. Profit = revenue \u2212 cost \u2212 expenses.",
      explanation: "Revenue = " + formatMoney(toPaise(rev)) + ", cost = " + formatMoney(toPaise(cost)) + ", so profit = " + formatMoney(toPaise(rev)) + " \u2212 " + formatMoney(toPaise(cost)) + " \u2212 " + formatMoney(toPaise(opex)) + " = " + formatMoney(toPaise(profit)) + "."
    };
  }

  var GENERATORS = {
    money: moneyQ, percent: percentQ, discount: discountQ, profitloss: profitLossQ,
    budget: budgetQ, simpleInterest: simpleInterestQ, compoundInterest: compoundInterestQ,
    successive: discountQ, markupMargin: markupMarginQ, breakeven: breakevenQ,
    revenueExpense: revenueExpenseQ
  };

  // Topics suggested per learning band.
  MM.bandTopics = function (band) {
    if (band === "junior") { return ["money", "percent", "discount", "profitloss", "budget", "simpleInterest"]; }
    if (band === "middle") { return ["discount", "successive", "profitloss", "markupMargin", "simpleInterest", "compoundInterest", "breakeven", "revenueExpense"]; }
    return ["successive", "markupMargin", "compoundInterest", "breakeven", "revenueExpense", "budget"];
  };

  function generateQuestion(opts) {
    opts = opts || {};
    var topic = opts.topic || pick(opts.rng || seededRng(1), TOPICS);
    var diff = opts.difficulty || 1;
    var gen = GENERATORS[topic];
    if (!gen) { topic = "money"; gen = moneyQ; }
    var rng = opts.rng || seededRng(mixSeed((opts.seed || 1) >>> 0, qSeq + 1));
    var q = gen(diff, rng);
    q.id = opts.id || qid(topic, diff, rng);
    q.topic = topic;
    q.validate = function (v) { return isFiniteNum(v); };
    return q;
  }
  MM.generateQuestion = generateQuestion;

  // Parse a numeric answer (rupees or a plain number) to a number.
  function parseAnswer(input) {
    if (isFiniteNum(input)) { return input; }
    if (typeof input !== "string") { return null; }
    var s = input.trim().replace(/\u20B9|Rs\.?/gi, "").replace(/[,\s]/g, "").replace(/%$/, "");
    if (!/^-?\d+(\.\d+)?$/.test(s)) { return null; }
    var n = parseFloat(s);
    return isFiniteNum(n) ? n : null;
  }
  MM.parseAnswer = parseAnswer;

  // Check a numeric answer against a question, within a tolerance.
  function checkNumericAnswer(q, submitted) {
    var v = parseAnswer(submitted);
    if (v == null) { return { correct: false, parsed: null }; }
    var tol = q.tolerance == null ? 0.01 : q.tolerance;
    var target = q.answerNumber;
    var ok = Math.abs(v - target) <= tol;
    return { correct: ok, parsed: v, expected: target };
  }
  MM.checkNumericAnswer = checkNumericAnswer;

  /* ==================================================================
   * 9. TYCOON SHOWDOWN
   * ================================================================ */

  var SHOWDOWN_DIFF = {
    rookie: { label: "Rookie", accuracy: 0.55, minDiff: 1, maxDiff: 1, rounds: 6, rival: "Rookie Rival" },
    professional: { label: "Professional", accuracy: 0.7, minDiff: 2, maxDiff: 2, rounds: 8, rival: "Pro Rival" },
    master: { label: "Master", accuracy: 0.82, minDiff: 2, maxDiff: 3, rounds: 8, rival: "Master Rival" }
  };
  MM.SHOWDOWN_DIFF = SHOWDOWN_DIFF;

  function createShowdown(difficulty, seed) {
    var cfg = SHOWDOWN_DIFF[difficulty] || SHOWDOWN_DIFF.rookie;
    seed = (seed == null ? 777 : seed) >>> 0;
    var rng = seededRng(seed);
    var pool = MM.bandTopics("middle").concat(MM.bandTopics("senior"));
    var questions = [];
    for (var i = 0; i < cfg.rounds; i++) {
      var diff = ri(rng, cfg.minDiff, cfg.maxDiff);
      var topic = pick(rng, pool);
      questions.push(generateQuestion({ topic: topic, difficulty: diff, rng: rng }));
    }
    return {
      difficulty: difficulty,
      config: cfg,
      seed: seed,
      questions: questions,
      index: 0,
      playerScore: 0,
      rivalScore: 0,
      history: [],
      done: false,
      winner: null
    };
  }
  MM.createShowdown = createShowdown;

  // Answer the current showdown question. Rival correctness is decided by
  // documented deterministic rules (accuracy threshold + seeded rng).
  function answerShowdown(session, submitted, rivalSeed) {
    if (session.done) { return { ok: false, error: "Match finished" }; }
    var q = session.questions[session.index];
    var res = checkNumericAnswer(q, submitted);
    var pts = res.correct ? q.marks : 0;
    session.playerScore += pts;
    var rng = seededRng(rivalSeed == null ? mixSeed(session.seed, session.index + 1) : rivalSeed);
    var rivalCorrect = rng() < session.config.accuracy;
    var rivalPts = rivalCorrect ? q.marks : 0;
    session.rivalScore += rivalPts;
    session.history.push({ index: session.index, topic: q.topic, correct: res.correct, playerPts: pts, rivalCorrect: rivalCorrect, rivalPts: rivalPts });
    session.index += 1;
    if (session.index >= session.questions.length) {
      session.done = true;
      session.winner = session.playerScore > session.rivalScore ? "player"
        : session.playerScore < session.rivalScore ? "rival" : "tie";
    }
    return {
      ok: true, correct: res.correct, expected: q.answerNumber, parsed: res.parsed,
      playerPts: pts, rivalCorrect: rivalCorrect, rivalPts: rivalPts,
      explanation: q.explanation, done: session.done, winner: session.winner,
      playerScore: session.playerScore, rivalScore: session.rivalScore
    };
  }
  MM.answerShowdown = answerShowdown;

  /* ==================================================================
   * 10. PROGRESSION + ACHIEVEMENTS
   * ================================================================ */

  var ACHIEVEMENTS = [
    { id: "first-sale", name: "First Sale", icon: "\uD83D\uDCB0", desc: "Complete your first sale." },
    { id: "smart-shopper", name: "Smart Shopper", icon: "\uD83D\uDED2", desc: "Buy stock at least 5 times." },
    { id: "profit-maker", name: "Profit Maker", icon: "\uD83D\uDCC8", desc: "Finish a day with a profit." },
    { id: "discount-detective", name: "Discount Detective", icon: "\uD83C\uDFF7\uFE0F", desc: "Give a discount and still sell." },
    { id: "budget-master", name: "Budget Master", icon: "\uD83E\uDDE9", desc: "Complete 3 budget challenges." },
    { id: "savings-strategist", name: "Savings Strategist", icon: "\uD83C\uDFE6", desc: "Earn interest on your savings." },
    { id: "compound-expert", name: "Compound Interest Expert", icon: "\uD83D\uDCA1", desc: "Answer a compound interest question correctly." },
    { id: "expansion-pioneer", name: "Expansion Pioneer", icon: "\uD83C\uDFD7\uFE0F", desc: "Reach business level 2." },
    { id: "cash-flow-controller", name: "Cash Flow Controller", icon: "\uD83D\uDD01", desc: "Never run out of cash and keep 3 profitable days." },
    { id: "tycoon-champion", name: "Tycoon Champion", icon: "\uD83C\uDFC6", desc: "Win a Tycoon Showdown match." }
  ];
  MM.ACHIEVEMENTS = ACHIEVEMENTS;

  function earned(state) {
    var s = state.stats;
    var a = {};
    a["first-sale"] = s.salesMade >= 1;
    a["smart-shopper"] = s.purchasesMade >= 5;
    a["profit-maker"] = state.days.some(function (d) { return d.profit > 0; });
    a["discount-detective"] = s.discountsGiven >= 1;
    a["budget-master"] = s.budgetChallenges >= 3;
    a["savings-strategist"] = s.interestEarnedPaise > 0;
    a["compound-expert"] = !!state._compoundSolved;
    a["expansion-pioneer"] = state.level >= 2;
    a["cash-flow-controller"] = state.cash > 0 && state.days.filter(function (d) { return d.profit > 0; }).length >= 3;
    a["tycoon-champion"] = s.showdownsWon >= 1;
    return a;
  }
  MM.earned = earned;

  function achievementStatus(state) {
    var e = earned(state);
    return ACHIEVEMENTS.map(function (x) {
      return { id: x.id, name: x.name, desc: x.desc, icon: x.icon, earned: !!e[x.id] };
    });
  }
  MM.achievementStatus = achievementStatus;

  function checkAchievements(state) {
    var e = earned(state);
    state.achievements = state.achievements || {};
    var fresh = [];
    ACHIEVEMENTS.forEach(function (x) {
      if (e[x.id] && !state.achievements[x.id]) { state.achievements[x.id] = true; fresh.push(x); }
    });
    return fresh;
  }
  MM.checkAchievements = checkAchievements;

  // Record a correct question answer (idempotent-friendly via counters).
  function recordAnswer(state, q, correct) {
    state.stats.questionsAnswered += 1;
    if (correct) {
      state.stats.questionsCorrect += 1;
      state.xp += q.marks || 10;
      if (q.topic === "compoundInterest") { state._compoundSolved = true; }
      state._streak = (state._streak || 0) + 1;
      if (state._streak > state.stats.bestStreak) { state.stats.bestStreak = state._streak; }
    } else {
      state._streak = 0;
    }
    var fresh = checkAchievements(state);
    return { xpGained: correct ? (q.marks || 10) : 0, fresh: fresh };
  }
  MM.recordAnswer = recordAnswer;

  /* ==================================================================
   * 11. PERSISTENCE (local-only, schema-versioned, validated)
   * ================================================================ */

  function serialize(state) {
    return JSON.stringify({
      v: MM.SAVE_VERSION,
      s: {
        seed: state.seed,
        day: state.day,
        cash: state.cash,
        revenue: state.revenue,
        expenses: state.expenses,
        cogs: state.cogs,
        xp: state.xp,
        level: state.level,
        reputation: state.reputation,
        satisfaction: state.satisfaction,
        inventory: state.inventory,
        prices: state.prices,
        discounts: state.discounts,
        savings: state.savings,
        interestEarned: state.interestEarned,
        upgrades: state.upgrades,
        days: state.days,
        ledger: state.ledger,
        txSeq: state.txSeq,
        servedToday: false,
        stats: state.stats,
        achievements: state.achievements,
        compoundSolved: !!state._compoundSolved,
        streak: state._streak || 0
      }
    });
  }
  MM.serialize = serialize;

  // Validate and hydrate a saved game; returns a fresh state on failure.
  function deserialize(raw) {
    var parsed;
    try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; }
    catch (e) { return null; }
    if (!parsed || typeof parsed !== "object") { return null; }
    var s = parsed.s;
    if (!s || typeof s !== "object") { return null; }
    if (parsed.v !== MM.SAVE_VERSION) { return null; } // no migration needed yet
    try {
      var state = newGame(Number.isInteger(s.seed) ? s.seed : 12345, { stockEach: 0 });
      state.day = saneInt(s.day, 1, 1, 100000);
      state.cash = saneInt(s.cash, CONFIG.startCashPaise, -1e15, 1e15);
      state.revenue = saneInt(s.revenue, 0, 0, 1e15);
      state.expenses = saneInt(s.expenses, 0, 0, 1e15);
      state.cogs = saneInt(s.cogs, 0, 0, 1e15);
      state.xp = saneInt(s.xp, 0, 0, 1e9);
      state.level = saneInt(s.level, 1, 1, 5);
      state.reputation = saneInt(s.reputation, CONFIG.reputationStart, 0, 100);
      state.satisfaction = saneInt(s.satisfaction, CONFIG.satisfactionStart, 0, 100);
      state.savings = saneInt(s.savings, 0, 0, 1e15);
      state.interestEarned = saneInt(s.interestEarned, 0, 0, 1e15);
      state.txSeq = saneInt(s.txSeq, 0, 0, 1e9);
      state.servedToday = false;
      state.inventory = saneInventory(s.inventory);
      state.prices = sanePrices(s.prices);
      state.discounts = saneDiscounts(s.discounts);
      state.upgrades = saneUpgrades(s.upgrades);
      state.days = Array.isArray(s.days) ? s.days.slice(-400) : [];
      state.ledger = Array.isArray(s.ledger) ? s.ledger.slice(-5000) : [];
      state.stats = Object.assign(blankStats(), (s.stats && typeof s.stats === "object") ? s.stats : {});
      state.achievements = (s.achievements && typeof s.achievements === "object") ? s.achievements : {};
      state._compoundSolved = !!s.compoundSolved;
      state._streak = saneInt(s.streak, 0, 0, 1e6);
      return state;
    } catch (e) { return null; }
  }
  MM.deserialize = deserialize;

  function saneInt(v, fallback, lo, hi) {
    if (!isFiniteNum(v)) { return fallback; }
    v = Math.round(v);
    if (v < lo) { return lo; }
    if (v > hi) { return hi; }
    return v;
  }
  function saneInventory(inv) {
    var out = {};
    if (!inv || typeof inv !== "object") { return out; }
    CATALOGUE.forEach(function (p) {
      var q = inv[p.id];
      out[p.id] = (isFiniteNum(q) && q > 0) ? Math.min(Math.floor(q), 100000) : 0;
    });
    return out;
  }
  function sanePrices(pr) {
    var out = {};
    CATALOGUE.forEach(function (p) {
      var v = pr && pr[p.id];
      out[p.id] = (isFiniteNum(v) && v >= 0) ? Math.round(v) : p.pricePaise;
    });
    return out;
  }
  function saneDiscounts(d) {
    var out = {};
    if (!d || typeof d !== "object") { return out; }
    CATALOGUE.forEach(function (p) {
      var v = d[p.id];
      if (isFiniteNum(v) && v >= 0 && v <= 90) { out[p.id] = v; }
    });
    return out;
  }
  function saneUpgrades(u) {
    var out = {};
    if (!u || typeof u !== "object") { return out; }
    UPGRADES.forEach(function (x) { if (u[x.id]) { out[x.id] = true; } });
    return out;
  }

  /* ==================================================================
   * 12. CONVENIENCE / SELF-CHECK
   * ================================================================ */

  MM.newGameFromSave = function (raw) { return deserialize(raw); };

  MM.selfCheck = function () {
    var errors = [];
    // Example 1: cost 40, sell 55 -> profit 15, 37.5%
    if (profitPctOnCost(toPaise(40), toPaise(55)) !== 37.5) { errors.push("profit% example"); }
    // Example 2: marked 1000, 10% -> 900
    if (priceAfterDiscount(toPaise(1000), 10) !== toPaise(900)) { errors.push("discount example"); }
    // Example 3: 5000 @5% simple 2y -> 500
    if (simpleInterest(toPaise(5000), 5, 2) !== toPaise(500)) { errors.push("simple interest example"); }
    // Example 4: 5000 @5% compound 2y -> 5512.50
    if (compoundAmount(toPaise(5000), 5, 2, 1) !== toPaise(5512.5)) { errors.push("compound interest example"); }
    // Example 6: 10 units @55 cost 40 -> rev 550, cogs 400, gross 150
    if (revenue(10, toPaise(55)) !== toPaise(550)) { errors.push("revenue example"); }
    if (cogs(10, toPaise(40)) !== toPaise(400)) { errors.push("cogs example"); }
    if (grossProfit(toPaise(550), toPaise(400)) !== toPaise(150)) { errors.push("gross profit example"); }
    return { ok: errors.length === 0, errors: errors };
  };

  return MM;
});