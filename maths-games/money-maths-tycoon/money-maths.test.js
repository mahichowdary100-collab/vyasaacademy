"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const MM = require("./money-maths.js");

const R = MM.RUPEE;
const fin = MM.fin;

/* ==================================================================
 * 1. THE TEN REQUIRED EXAMPLES (exact, from the master brief)
 * ================================================================ */

test("example 1: cost Rs 40, sell Rs 55 -> profit Rs 15, 37.5% on cost", () => {
  const pl = fin.profitLoss(MM.toPaise(40), MM.toPaise(55));
  assert.equal(pl.profit, MM.toPaise(15));
  assert.equal(pl.isProfit, true);
  assert.equal(fin.profitPctOnCost(MM.toPaise(40), MM.toPaise(55)), 37.5);
});

test("example 2: marked Rs 1000 with 10% discount -> Rs 900", () => {
  assert.equal(fin.priceAfterDiscount(MM.toPaise(1000), 10), MM.toPaise(900));
});

test("example 3: Rs 5000 at 5% simple interest for 2 years -> Rs 500 / Rs 5500", () => {
  assert.equal(fin.simpleInterest(MM.toPaise(5000), 5, 2), MM.toPaise(500));
  assert.equal(fin.simpleAmount(MM.toPaise(5000), 5, 2), MM.toPaise(5500));
});

test("example 4: Rs 5000 at 5% compound interest for 2 years -> Rs 5512.50", () => {
  assert.equal(fin.compoundAmount(MM.toPaise(5000), 5, 2, 1), MM.toPaise(5512.5));
  assert.equal(fin.compoundInterest(MM.toPaise(5000), 5, 2, 1), MM.toPaise(512.5));
});

test("example 5: cash Rs 10000, purchase Rs 2000 -> cash Rs 8000", () => {
  const s = MM.newGame(1);
  assert.equal(s.cash, MM.toPaise(10000));
  const res = MM.buyStock(s, "notebook", 50); // 50 x Rs 40 = Rs 2000
  assert.equal(res.ok, true);
  assert.equal(res.total, MM.toPaise(2000));
  assert.equal(s.cash, MM.toPaise(8000));
});

test("example 6: 10 units at Rs 55, cost Rs 40 -> rev 550, COGS 400, gross 150", () => {
  assert.equal(fin.revenue(10, MM.toPaise(55)), MM.toPaise(550));
  assert.equal(fin.cogs(10, MM.toPaise(40)), MM.toPaise(400));
  assert.equal(fin.grossProfit(MM.toPaise(550), MM.toPaise(400)), MM.toPaise(150));
});

test("example 7: a transaction that exceeds cash is rejected", () => {
  const s = MM.newGame(2);
  const res = MM.buyStock(s, "tiffin", 10000); // far beyond Rs 10000
  assert.equal(res.ok, false);
  assert.match(res.error, /cash/i);
  assert.equal(s.cash, MM.toPaise(10000), "cash untouched after rejection");
});

test("example 8: overselling is impossible without stock", () => {
  const s = MM.newGame(3, { stockEach: 0 });
  assert.equal(MM.totalStock(s), 0);
  const day = MM.serveCustomers(s);
  assert.equal(day.ok, true);
  assert.equal(day.units, 0, "no units can be sold with empty shelves");
  assert.equal(day.revenue, 0);
  for (const id of Object.keys(s.inventory)) {
    assert.ok(s.inventory[id] >= 0, "inventory never goes negative");
  }
});

test("example 9: invalid and non-finite input is rejected", () => {
  const s = MM.newGame(4);
  assert.equal(MM.setPrice(s, "notebook", NaN).ok, false);
  assert.equal(MM.setPrice(s, "notebook", -5).ok, false);
  assert.equal(MM.setPrice(s, "ghost", 100).ok, false);
  assert.equal(MM.setDiscount(s, "notebook", -1).ok, false);
  assert.equal(MM.setDiscount(s, "notebook", 200).ok, false);
  assert.equal(MM.buyStock(s, "notebook", NaN).ok, false);
  assert.equal(MM.buyStock(s, "notebook", 2.5).ok, false);
  assert.equal(MM.buyStock(s, "notebook", -3).ok, false);
  assert.equal(MM.bankDeposit(s, Infinity).ok, false);
  assert.equal(MM.parseMoney("abc"), null);
  assert.equal(MM.parseMoney("1.2.3"), null);
  assert.equal(MM.parseAnswer("hello"), null);
  assert.ok(Number.isNaN(MM.toPaise(NaN)));
  assert.ok(Number.isNaN(fin.simpleInterest(NaN, 5, 2)));
});

test("example 10: rounding never corrupts cash (always whole paise)", () => {
  const s = MM.newGame(5);
  // a discount that produces a fractional paise is rounded to whole paise
  MM.setPrice(s, "notebook", MM.toPaise(55));
  MM.setDiscount(s, "notebook", 33); // 33% of 5500 = 1815 exactly
  s.servedToday = false;
  MM.serveCustomers(s);
  MM.closeDay(s);
  assert.ok(Number.isInteger(s.cash), "cash stays an integer");
  assert.ok(Number.isInteger(s.revenue), "revenue stays an integer");
  assert.ok(Number.isInteger(s.cogs), "cogs stays an integer");
  // half-up boundary keeps paise integral
  assert.equal(MM.toPaise(0.005), 1);
  assert.equal(MM.roundHalfUp(2.5), 3);
  assert.equal(MM.roundHalfUp(-2.5), -3);
});

/* ==================================================================
 * 2. MONEY CORE
 * ================================================================ */

test("Indian grouping and currency formatting", () => {
  assert.equal(MM.groupIndian("1"), "1");
  assert.equal(MM.groupIndian("125"), "125");
  assert.equal(MM.groupIndian("1250"), "1,250");
  assert.equal(MM.groupIndian("125000"), "1,25,000");
  assert.equal(MM.groupIndian("12345678"), "1,23,45,678");
  assert.equal(MM.formatMoney(MM.toPaise(125000)), R + "1,25,000.00");
  assert.equal(MM.formatMoney(MM.toPaise(5512.5)), R + "5,512.50");
  assert.equal(MM.formatMoney(MM.toPaise(-900)), "-" + R + "900.00");
  assert.equal(MM.formatRupees(MM.toPaise(125000)), R + "1,25,000");
});

test("parseMoney accepts rupee sign, grouping and signs", () => {
  assert.equal(MM.parseMoney(1234), 123400);
  assert.equal(MM.parseMoney("55"), 5500);
  assert.equal(MM.parseMoney(R + "1,25,000.50"), 12500050);
  assert.equal(MM.parseMoney("Rs. 900"), 90000);
  assert.equal(MM.parseMoney("INR 1,000"), 100000);
  assert.equal(MM.parseMoney("-250"), -25000);
  assert.equal(MM.parseMoney("12.345"), null); // more than 2 dp
  assert.equal(MM.parseMoney(""), null);
  assert.equal(MM.parseMoney(null), null);
});

test("safe monetary arithmetic keeps integers", () => {
  assert.equal(MM.addMoney(5500, 4500), 10000);
  assert.equal(MM.subMoney(10000, 2000), 8000);
  assert.equal(MM.mulMoney(5500, 10), 55000);
  assert.equal(MM.pctOfPaise(5500, 10), 550);
  assert.throws(() => MM.addMoney(5500.5, 1));
  assert.throws(() => MM.mulMoney(5500.5, 1));
});

/* ==================================================================
 * 3. FINANCIAL MATHEMATICS
 * ================================================================ */

test("profit, loss, markup and margin are distinct and correct", () => {
  const cost = MM.toPaise(80), sell = MM.toPaise(100);
  assert.equal(fin.profitPctOnCost(cost, sell), 25); // markup on cost
  assert.equal(fin.markupPct(cost, sell), 25);
  assert.equal(fin.profitMarginPct(cost, sell), 20); // margin on selling price
  assert.equal(fin.lossPctOnCost(sell, cost), 20);
  assert.equal(fin.profitPctOnCost(0, sell), null);
});

test("successive discounts are not additive", () => {
  const marked = MM.toPaise(1000);
  const both = fin.successiveDiscounts(marked, [10, 20]);
  assert.equal(both, MM.toPaise(720)); // 1000 * 0.9 * 0.8
  assert.notEqual(both, fin.priceAfterDiscount(marked, 30));
  assert.equal(fin.priceAfterDiscount(marked, 30), MM.toPaise(700));
});

test("target profit price and max no-loss discount", () => {
  assert.equal(fin.priceForTargetProfitPct(MM.toPaise(80), 25), MM.toPaise(100));
  assert.equal(fin.maxDiscountPctWithoutLoss(MM.toPaise(100), MM.toPaise(80)), 20);
  assert.equal(fin.maxDiscountPctWithoutLoss(0, 0), null);
});

test("compound interest matches annual compounding at integer periods", () => {
  assert.equal(fin.compoundAmount(MM.toPaise(1000), 10, 3, 1), MM.toPaise(1331));
  assert.equal(fin.compoundAmount(MM.toPaise(1000), 10, 1, 2), MM.toPaise(1102.5));
});

test("break-even rounds up and rejects no-contribution cases", () => {
  assert.equal(fin.breakEvenUnits(MM.toPaise(50), MM.toPaise(30), MM.toPaise(600)), 30);
  assert.equal(fin.breakEvenUnits(MM.toPaise(50), MM.toPaise(30), MM.toPaise(650)), 33);
  assert.equal(fin.breakEvenUnits(MM.toPaise(30), MM.toPaise(50), MM.toPaise(600)), null);
});

test("inventory value sums stock at cost", () => {
  const s = MM.newGame(9, { stockEach: 5 });
  const v = fin.inventoryValue(s.inventory, MM.CATALOGUE);
  const expected = MM.CATALOGUE.reduce((a, p) => a + 5 * p.costPaise, 0);
  assert.equal(v, expected);
});

/* ==================================================================
 * 4. BUSINESS SIMULATION
 * ================================================================ */

test("new game starts with the documented opening balance and ledger", () => {
  const s = MM.newGame(42);
  assert.equal(s.cash, MM.toPaise(10000));
  assert.equal(s.day, 1);
  assert.equal(s.level, 1);
  assert.equal(s.ledger.length, 1);
  assert.equal(s.ledger[0].kind, "open");
});

test("buying stock is an asset swap, not an operating expense", () => {
  const s = MM.newGame(7);
  const before = s.cash;
  const res = MM.buyStock(s, "pen", 10); // 10 x Rs 6 = Rs 60
  assert.equal(res.ok, true);
  assert.equal(s.cash, before - MM.toPaise(60));
  assert.equal(s.expenses, 0, "stock purchase is not opex");
  assert.equal(s.inventory["pen"], 15);
});

test("storage capacity blocks oversized orders", () => {
  const s = MM.newGame(8, { stockEach: 0 });
  s.cash = MM.toPaise(1e6);
  const cap = MM.storageCapacity(s);
  const res = MM.buyStock(s, "pen", cap + 1);
  assert.equal(res.ok, false);
  assert.match(res.error, /storage/i);
});

test("serving customers is idempotent per day (no duplicate transactions)", () => {
  const s = MM.newGame(11);
  const first = MM.serveCustomers(s);
  assert.equal(first.ok, true);
  const snapshot = JSON.parse(JSON.stringify({ cash: s.cash, inv: s.inventory }));
  const second = MM.serveCustomers(s);
  assert.equal(second.ok, false);
  assert.equal(s.cash, snapshot.cash, "double serving must not change cash");
  assert.deepEqual(s.inventory, snapshot.inv, "double serving must not change stock");
});

test("selling never exceeds stock and records correct revenue/cogs", () => {
  const s = MM.newGame(13, { stockEach: 0 });
  MM.setPrice(s, "notebook", MM.toPaise(55));
  MM.buyStock(s, "notebook", 10);
  const day = MM.serveCustomers(s);
  assert.equal(day.ok, true);
  const nb = day.sales.find((x) => x.productId === "notebook");
  assert.ok(nb.units <= 10, "cannot sell more than 10");
  assert.equal(nb.cogs, nb.units * MM.toPaise(40));
  assert.equal(nb.revenue, nb.units * MM.toPaise(55));
});

test("closing the day applies operating costs and advances time", () => {
  const s = MM.newGame(17);
  MM.serveCustomers(s);
  const res = MM.closeDay(s);
  assert.equal(res.ok, true);
  assert.equal(s.day, 2);
  assert.equal(s.servedToday, false);
  assert.equal(res.record.opex, MM.dailyOperatingExpense(s) + 0);
  assert.equal(res.record.opex, MM.toPaise(250) + MM.toPaise(300) + MM.toPaise(120));
});

test("closing the day before serving is rejected", () => {
  const s = MM.newGame(18);
  const res = MM.closeDay(s);
  assert.equal(res.ok, false);
  assert.match(res.error, /serve/i);
});

test("supplier upgrade reduces purchase costs", () => {
  const s = MM.newGame(19);
  s.upgrades["supplier"] = true;
  const p = MM.catalogById("notebook");
  assert.equal(MM.supplierCost(s, p), MM.toPaise(36)); // 10% off Rs 40
});

test("savings deposit/withdraw conserve total money and accrue interest", () => {
  const s = MM.newGame(21);
  assert.equal(MM.bankDeposit(s, MM.toPaise(4000)).ok, true);
  assert.equal(s.cash, MM.toPaise(6000));
  assert.equal(s.savings, MM.toPaise(4000));
  const interest = MM.accrueSavings(s, 5, 2, "simple");
  assert.equal(interest, MM.toPaise(400));
  assert.equal(s.savings, MM.toPaise(4400));
  assert.equal(s.stats.interestEarnedPaise, MM.toPaise(400));
  assert.equal(MM.bankWithdraw(s, MM.toPaise(4400)).ok, true);
  assert.equal(s.cash, MM.toPaise(10400));
  assert.equal(s.savings, 0);
  assert.equal(MM.bankWithdraw(s, MM.toPaise(1)).ok, false);
});

test("savings projection is monotonic for positive rates", () => {
  const rows = MM.savingsProjection(MM.toPaise(5000), 5, 3, "compound");
  assert.equal(rows.length, 4);
  assert.equal(rows[0].amount, MM.toPaise(5000));
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i].amount > rows[i - 1].amount, "grows each year");
  }
});

test("an upgrade is rejected when cash is insufficient", () => {
  const s = MM.newGame(23);
  s.cash = MM.toPaise(100); // less than any upgrade
  const res = MM.buyUpgrade(s, "shelf");
  assert.equal(res.ok, false);
  assert.match(res.error, /cash/i);
  assert.equal(s.upgrades["shelf"], undefined, "not granted on failure");
});

test("buying an affordable upgrade raises storage and is not repeatable", () => {
  const s = MM.newGame(24);
  const before = MM.storageCapacity(s);
  assert.equal(MM.buyUpgrade(s, "shelf").ok, true);
  assert.equal(MM.storageCapacity(s), before + 60);
  assert.equal(MM.buyUpgrade(s, "shelf").ok, false);
  assert.equal(MM.buyUpgrade(s, "ghost").ok, false);
});

test("level unlock respects every requirement", () => {
  const s = MM.newGame(25);
  let st = MM.levelUnlockStatus(s);
  assert.equal(st.atMax, false);
  assert.equal(st.canUnlock, false, "fresh shop cannot jump to level 2");
  s.reputation = 90;
  s.days = new Array(10).fill(0).map((_, i) => ({ day: i + 1, profit: 100 }));
  s.stats.totalProfitPaise = MM.toPaise(5000);
  st = MM.levelUnlockStatus(s);
  assert.equal(st.canUnlock, true);
  assert.equal(MM.unlockNextLevel(s).ok, true);
  assert.equal(s.level, 2);
});

/* ==================================================================
 * 5. BUDGET
 * ================================================================ */

test("budget validation and analysis", () => {
  const g = MM.validateBudget({ inventory: MM.toPaise(3000), rent: MM.toPaise(1000), reserve: MM.toPaise(500) });
  assert.equal(g.valid, true);
  assert.equal(g.totalPaise, MM.toPaise(4500));
  const bad = MM.validateBudget({ inventory: -5 });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.length >= 1);
  const a = MM.budgetAnalysis({ inventory: MM.toPaise(3000), rent: MM.toPaise(1000) }, MM.toPaise(10000), MM.toPaise(6000));
  assert.equal(a.remainingPaise, MM.toPaise(6000));
  assert.equal(a.plannedProfitPaise, MM.toPaise(2000));
  assert.equal(a.overBudget, false);
  const over = MM.budgetAnalysis({ inventory: MM.toPaise(12000) }, MM.toPaise(10000), 0);
  assert.equal(over.overBudget, true);
});

/* ==================================================================
 * 6. REPORTS
 * ================================================================ */

test("buildReport reconciles ledger revenue with running totals", () => {
  const s = MM.newGame(31);
  MM.serveCustomers(s);
  MM.closeDay(s);
  const r = MM.buildReport(s);
  assert.equal(r.revenue, s.revenue);
  assert.equal(r.cogs, s.cogs);
  assert.equal(r.closingCash, s.cash);
  assert.equal(r.grossProfit, s.revenue - s.cogs);
  assert.equal(r.operatingExpenses, MM.toPaise(670));
  assert.equal(r.operatingProfit, r.grossProfit - r.operatingExpenses);
  assert.ok(typeof r.bestSeller === "string");
});

test("chartData mirrors the day records", () => {
  const s = MM.newGame(32);
  MM.serveCustomers(s);
  MM.closeDay(s);
  const c = MM.chartData(s);
  assert.equal(c.length, 1);
  assert.equal(c[0].day, 1);
  assert.equal(c[0].profit, s.days[0].profit);
});

/* ==================================================================
 * 7. QUESTION GENERATION
 * ================================================================ */

test("every topic generates valid questions across difficulties", () => {
  for (const topic of MM.TOPICS) {
    for (let diff = 1; diff <= 3; diff++) {
      for (let seed = 0; seed < 25; seed++) {
        const q = MM.generateQuestion({ topic, difficulty: diff, seed: seed + 1, rng: MM.seededRng(seed + 1) });
        assert.equal(typeof q.prompt, "string");
        assert.ok(q.prompt.length > 5, topic + " prompt");
        assert.equal(typeof q.explanation, "string");
        assert.ok(q.marks > 0, topic + " marks");
        assert.ok(isFinite(q.answerNumber), topic + " numeric answer");
        assert.equal(q.type, "number");
      }
    }
  }
});

test("a question's own answer always checks correct", () => {
  for (const topic of MM.TOPICS) {
    for (let seed = 0; seed < 30; seed++) {
      const q = MM.generateQuestion({ topic, difficulty: 2, rng: MM.seededRng(seed + 1) });
      const res = MM.checkNumericAnswer(q, q.answerNumber);
      assert.equal(res.correct, true, topic + " " + q.answerNumber);
    }
  }
});

test("answer tolerance rejects near-misses", () => {
  const q = MM.generateQuestion({ topic: "percent", difficulty: 1, rng: MM.seededRng(3) });
  assert.equal(MM.checkNumericAnswer(q, q.answerNumber).correct, true);
  assert.equal(MM.checkNumericAnswer(q, q.answerNumber + 5).correct, false);
  assert.equal(MM.checkNumericAnswer(q, "not a number").correct, false);
});

test("band topics cover the documented learning bands", () => {
  assert.ok(MM.bandTopics("junior").includes("percent"));
  assert.ok(MM.bandTopics("middle").includes("successive"));
  assert.ok(MM.bandTopics("senior").includes("breakeven"));
  assert.deepEqual(MM.bandTopics("unknown"), MM.bandTopics("senior"));
});

/* ==================================================================
 * 8. SHOWDOWN
 * ================================================================ */

test("showdown runs to completion and is deterministic", () => {
  const a = MM.createShowdown("rookie", 99);
  const b = MM.createShowdown("rookie", 99);
  assert.equal(a.questions.length, a.config.rounds);
  assert.deepEqual(
    a.questions.map((q) => q.prompt),
    b.questions.map((q) => q.prompt)
  );
  while (!a.done) {
    const q = a.questions[a.index];
    MM.answerShowdown(a, q.answerNumber);
  }
  assert.equal(a.done, true);
  assert.ok(["player", "rival", "tie"].includes(a.winner));
  assert.equal(a.playerScore, a.questions.reduce((t, q) => t + q.marks, 0), "perfect play scores max");
});

test("a finished showdown rejects further answers", () => {
  const s = MM.createShowdown("rookie", 5);
  while (!s.done) { MM.answerShowdown(s, s.questions[s.index].answerNumber); }
  assert.equal(MM.answerShowdown(s, 0).ok, false);
});

/* ==================================================================
 * 9. ACHIEVEMENTS
 * ================================================================ */

test("achievements unlock from the correct stats", () => {
  const s = MM.newGame(41);
  assert.equal(MM.achievementStatus(s).filter((a) => a.earned).length, 0);
  s.stats.salesMade = 1;
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "first-sale").earned, true);
  s.stats.purchasesMade = 5;
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "smart-shopper").earned, true);
  s.days = [{ day: 1, profit: 10 }];
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "profit-maker").earned, true);
  s.stats.discountsGiven = 1;
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "discount-detective").earned, true);
  s.stats.budgetChallenges = 3;
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "budget-master").earned, true);
  s.stats.interestEarnedPaise = 100;
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "savings-strategist").earned, true);
  s._compoundSolved = true;
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "compound-expert").earned, true);
  s.level = 2;
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "expansion-pioneer").earned, true);
  s.stats.showdownsWon = 1;
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "tycoon-champion").earned, true);
  s.cash = 1;
  s.days = [{ profit: 1 }, { profit: 1 }, { profit: 1 }];
  assert.equal(MM.achievementStatus(s).find((a) => a.id === "cash-flow-controller").earned, true);
});

test("checkAchievements only reports freshly earned badges once", () => {
  const s = MM.newGame(42);
  s.stats.salesMade = 1;
  const fresh = MM.checkAchievements(s);
  assert.equal(fresh.some((a) => a.id === "first-sale"), true);
  const again = MM.checkAchievements(s);
  assert.equal(again.length, 0, "no duplicate badge awards");
});

test("recordAnswer tracks xp, streaks and compound expertise", () => {
  const s = MM.newGame(43);
  const q = { topic: "compoundInterest", marks: 20 };
  s.stats.questionsCorrect = 0;
  const r1 = MM.recordAnswer(s, q, true);
  assert.equal(r1.xpGained, 20);
  assert.equal(s.xp, 20);
  assert.equal(s._compoundSolved, true);
  assert.equal(s._streak, 1);
  MM.recordAnswer(s, q, true);
  assert.equal(s.stats.bestStreak, 2);
  MM.recordAnswer(s, q, false);
  assert.equal(s._streak, 0);
  assert.equal(s.stats.questionsAnswered, 3);
});

/* ==================================================================
 * 10. PERSISTENCE
 * ================================================================ */

test("save/load round-trips the full game state", () => {
  const s = MM.newGame(51);
  MM.buyStock(s, "pen", 4);
  MM.setPrice(s, "pen", MM.toPaise(12));
  MM.setDiscount(s, "pen", 10);
  MM.serveCustomers(s);
  MM.closeDay(s);
  MM.bankDeposit(s, MM.toPaise(1000));
  MM.accrueSavings(s, 5, 1, "simple");
  s._compoundSolved = true;
  const raw = MM.serialize(s);
  const t = MM.deserialize(raw);
  assert.ok(t, "hydrates");
  assert.equal(t.cash, s.cash);
  assert.equal(t.day, s.day);
  assert.equal(t.xp, s.xp);
  assert.equal(t.savings, s.savings);
  assert.equal(t._compoundSolved, true);
  assert.deepEqual(t.inventory, s.inventory);
  assert.deepEqual(t.prices, s.prices);
  assert.deepEqual(t.discounts, s.discounts);
  assert.equal(t.days.length, s.days.length);
  assert.equal(t.ledger.length, s.ledger.length);
});

test("deserialize rejects corrupt or foreign saves", () => {
  assert.equal(MM.deserialize("not json"), null);
  assert.equal(MM.deserialize(null), null);
  assert.equal(MM.deserialize(JSON.stringify({ v: 999, s: {} })), null);
  assert.equal(MM.deserialize(JSON.stringify({ v: MM.SAVE_VERSION })), null);
});

test("deserialize repairs hostile numbers and caps arrays", () => {
  const evil = JSON.stringify({
    v: MM.SAVE_VERSION,
    s: {
      cash: -999,
      day: 1e18,
      reputation: 5000,
      level: 99,
      inventory: { pen: -3, ghost: 999999 },
      prices: { pen: -4 },
      ledger: new Array(9000).fill({ kind: "sale", amount: 1 })
    }
  });
  const t = MM.deserialize(evil);
  assert.ok(t);
  assert.ok(t.cash >= -1e15, "clamped into a sane range");
  assert.ok(t.reputation <= 100 && t.reputation >= 0);
  assert.ok(t.level <= 5);
  assert.ok(t.inventory["pen"] >= 0);
  assert.equal(t.inventory["ghost"], undefined);
  assert.ok(t.prices["pen"] >= 0);
  assert.ok(t.ledger.length <= 5000, "ledger capped");
});

/* ==================================================================
 * 11. SELF CHECK + META
 * ================================================================ */

test("engine selfCheck passes", () => {
  const r = MM.selfCheck();
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

test("catalogue and upgrades are well-formed", () => {
  assert.equal(MM.CATALOGUE.length, 10);
  const ids = new Set();
  for (const p of MM.CATALOGUE) {
    assert.ok(!ids.has(p.id));
    ids.add(p.id);
    assert.ok(p.pricePaise > p.costPaise, p.id + " sells above cost by default");
    assert.ok(p.demand > 0);
  }
  assert.equal(MM.UPGRADES.length, 6);
  assert.equal(MM.LEVELS.length, 5);
  assert.equal(MM.ACHIEVEMENTS.length, 10);
  assert.equal(MM.SAVE_VERSION, 1);
});
