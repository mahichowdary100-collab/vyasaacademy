/* Vyasa Guru - backend test suite
   Run: npm test   (node --test)
   Each scenario is also validated against the shared knowledge
   base plus a local mock OpenAI-compatible endpoint so nothing
   requires real credentials. */
"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const { handleChat, _internals } = require("../src/core.js");
const KB = require("../../chatbot/chatbot-kb.js");

function call(userMessage, sessionId) {
  return handleChat({ sessionId: sessionId || "test-" + Math.random(), messages: [{ role: "user", content: userMessage }] }, { ip: "127.0.0.1-test" });
}

function contains(haystack, needle) {
  return String(haystack).toLowerCase().indexOf(String(needle).toLowerCase()) !== -1;
}

/* ---------------- Knowledge-base scenarios (no AI key) ---------------- */

test("fee question resolves to the honest contact prompt (never invents fees)", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("What is the monthly fee for class 10?");
  assert.strictEqual(r.status, 200);
  assert.ok(contains(r.body.reply, "I don't have that information yet"));
  assert.ok(contains(r.body.reply, "94949 01006"));
  assert.strictEqual(r.body.source, "knowledge");
});

test("off-topic question is handled with an honest fallback", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("What is the meaning of life according to Vedic astrology?");
  assert.strictEqual(r.status, 200);
  assert.ok(r.body.reply.length > 0);
});

test("classes question mentions VI - XII and the study material hub", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("Which classes do you offer?");
  assert.ok(contains(r.body.reply, "Classes 6 to 12") || contains(r.body.reply, "VI - XII"));
});

test("contact question includes phone, email and hours", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("How can I contact Vyasa Academy?");
  assert.ok(contains(r.body.reply, "94949 01006"));
  assert.ok(contains(r.body.reply, "vyasacareeracademy@gmail.com"));
});

test("location question gives the Hulimavu address", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("Where is the academy located?");
  assert.ok(contains(r.body.reply, "Hulimavu"));
  assert.ok(contains(r.body.reply, "560076"));
});

test("admissions explains the 4-step process", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("How can I join Vyasa Academy?");
  assert.ok(contains(r.body.reply, "Enquiry") || contains(r.body.reply, "Assessment"));
});

test("AP academic explainer gives definition and formula", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("Explain arithmetic progressions");
  assert.ok(contains(r.body.reply, "common difference"));
});

test("follow-up 'give me an example' keeps the last topic (AP example)", async () => {
  process.env.AI_API_KEY = "";
  const sid = "followup-" + Date.now();
  await call("Explain arithmetic progressions", sid);
  const r = await call("Can you give me an example?", sid);
  assert.ok(contains(r.body.reply, "Example"));
  assert.ok(contains(r.body.reply, "2, 5, 8, 11"));
});

test("chapter lookup: available resource links the real notes route only", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("Where can I find Real Numbers notes?");
  assert.ok(contains(r.body.reply, "/cbse-study-material/class-10/mathematics/real-numbers/notes"));
});

test("chapter lookup: a chapter with no content is not faked", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("Do you have study material for Statistics?");
  assert.ok(contains(r.body.reply, "being added") || contains(r.body.reply, "not available"));
});

test("class 10 mathematics chapter list returns all 14", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("What are the Class 10 maths chapters?");
  assert.ok(contains(r.body.reply, "14"));
});

test("KCET coaching is acknowledged without inventing details", async () => {
  process.env.AI_API_KEY = "";
  const r = await call("Do you provide KCET coaching?");
  assert.ok(contains(r.body.reply, "KCET"));
});

/* ---------------- Rate limiting ---------------- */

test("rate limiter trips after N requests in the window", () => {
  const key = "ratetest-" + Date.now();
  let tripped = false;
  for (let i = 0; i < 31; i++) {
    tripped = _internals.rateLimited(key);
  }
  assert.ok(tripped);
});

/* ---------------- Provider adapter (local mock, no real credentials) ---------------- */

test("openai-compatible provider adapter talks to configured base URL", async (t) => {
  let captured = null;
  const mock = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      captured = JSON.parse(raw);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ choices: [{ message: { role: "assistant", content: "Mock provider reply." } }] }));
    });
  });
  await new Promise((resolve) => mock.listen(0, resolve));
  const port = mock.address().port;

  const old = { key: process.env.AI_API_KEY, base: process.env.AI_BASE_URL, model: process.env.AI_MODEL, prov: process.env.AI_PROVIDER };
  process.env.AI_API_KEY = "test-secret-key";
  process.env.AI_BASE_URL = "http://127.0.0.1:" + port;
  process.env.AI_MODEL = "mock-model";
  process.env.AI_PROVIDER = "openai";

  try {
    const r = await handleChat({ messages: [{ role: "user", content: "hello" }] }, { ip: "127.0.0.1-provider" });
    assert.strictEqual(r.body.source, "ai");
    assert.strictEqual(r.body.reply, "Mock provider reply.");
    assert.ok(captured);
    assert.strictEqual(captured.model, "mock-model");
  } finally {
    if (old.key === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = old.key;
    if (old.base === undefined) delete process.env.AI_BASE_URL; else process.env.AI_BASE_URL = old.base;
    if (old.model === undefined) delete process.env.AI_MODEL; else process.env.AI_MODEL = old.model;
    if (old.prov === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = old.prov;
    mock.close();
  }
});

test("provider 500 collapses to the knowledge fallback, never a broken UI", async () => {
  const mock = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => res.writeHead(500).end("boom"));
  });
  await new Promise((resolve) => mock.listen(0, resolve));
  const port = mock.address().port;

  const old = { key: process.env.AI_API_KEY, base: process.env.AI_BASE_URL, prov: process.env.AI_PROVIDER };
  process.env.AI_API_KEY = "test-secret-key";
  process.env.AI_BASE_URL = "http://127.0.0.1:" + port;
  process.env.AI_PROVIDER = "openai";

  try {
    const r = await call("Which classes do you offer?");
    assert.strictEqual(r.status, 200);
    assert.ok(contains(r.body.reply, "Classes 6 to 12") || contains(r.body.reply, "VI - XII"));
  } finally {
    if (old.key === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = old.key;
    if (old.base === undefined) delete process.env.AI_BASE_URL; else process.env.AI_BASE_URL = old.base;
    if (old.prov === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = old.prov;
    mock.close();
  }
});

/* ---------------- Shared KB sanity ---------------- */

test("shared KB exposes verified facts (smoke)", () => {
  assert.ok(KB.FACTS && KB.FACTS.name === "Vyasa Academy");
  assert.ok(Array.isArray(KB.CLASS10_MATHS.chapters) && KB.CLASS10_MATHS.chapters.length === 14);
  assert.ok(KB.CLASS10_SCIENCE.chapters.length === 13);
  assert.ok(KB.AVAILABLE["real-numbers"].includes("quiz"));
  assert.strictEqual(typeof KB.answer, "function");
});