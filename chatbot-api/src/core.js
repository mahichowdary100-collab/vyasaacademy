/* ============================================================
   Vyasa Academy Assistant - backend core
   ------------------------------------------------------------
   Provider-agnostic chat engine. Reads configuration from
   environment variables; requires no runtime npm dependencies
   (uses global fetch, available in Node 18+).

   Providers (AI_PROVIDER):
     - "openai" (default)        OpenAI-compatible /v1/chat/completions
     - "openai-responses"        OpenAI /v1/responses payload

   Environment variables:
     AI_PROVIDER   one of openai | openai-responses   (default openai)
     AI_MODEL      model id (e.g. gpt-4o-mini)
     AI_API_KEY    secret provider key (never in browser code)
     AI_BASE_URL   base URL (default https://api.openai.com)
     AI_TIMEOUT_MS request timeout (default 15000)
   ============================================================ */
"use strict";

const KB = require("../../chatbot/chatbot-kb.js");
const crypto = require("crypto");

const DEFAULT_BASE_URL = "https://api.openai.com";
const DEFAULT_TIMEOUT = 15000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY = 20;
const MAX_REQUESTS_PER_WINDOW = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const FALLBACK_BUSY = "The assistant is temporarily busy. Please try again in a few minutes.";
const FALLBACK_RATE = "The assistant is receiving a lot of questions right now. Please try again in a few minutes.";
const FALLBACK_NOAPI = "I don't have that information yet. Please contact Vyasa Academy directly.";

function getConfig() {
  return {
    provider: (process.env.AI_PROVIDER || "openai").toLowerCase(),
    model: process.env.AI_MODEL || "gpt-4o-mini",
    apiKey: process.env.AI_API_KEY || "",
    baseUrl: (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || String(DEFAULT_TIMEOUT), 10) || DEFAULT_TIMEOUT
  };
}

function buildSystemPrompt() {
  const facts = KB.FACTS;
  return [
    "You are the Vyasa Academy Assistant, the official AI assistant for Vyasa Academy, an educational institution in Hulimavu, Bangalore.",
    "Only answer from the verified facts provided below. Never invent fees, results, ratings, rankings, awards, placements, timings, schedules, faculty or content details that are not listed here.",
    "If you are asked for information that is not in the verified facts, answer honestly with: \"I don't have enough verified information to answer that accurately. Please contact Vyasa Academy directly at +91 94949 01006.\"",
    "VERIFIED ACADEMY FACTS:",
    "- Tagline: " + facts.tagline,
    "- Founded: " + facts.founded,
    "- Location: " + facts.location,
    "- Phone / WhatsApp: " + facts.phone + " (" + facts.whatsappLink + ")",
    "- Email: " + facts.email,
    "- Hours: " + facts.hours,
    "- Classes: " + facts.classes,
    "- Curriculum: " + facts.boards,
    "- Subjects taught: " + facts.subjects,
    "- Streams: " + facts.streams,
    "- Areas served: " + facts.areasServed.join(", "),
    "- Faculty: " + facts.facultyShort,
    "",
    "STUDY MATERIAL:",
    "The website offers free CBSE study material. Use these existing routes only (never invent URLs):",
    "- Hub: " + KB.LINKS.sm,
    "- Class 10 Mathematics: " + KB.LINKS.maths,
    "- Class 10 Science: " + KB.LINKS.science,
    "For a Class 10 Mathematics/Science chapter the user asks about, link the chapter page only if it exists and only name resources (notes/practice-paper/quiz/test) that are genuinely available. Do not send a user to a page that is still under construction.",
    "",
    "RULES:",
    "- Fee, cost or pricing questions: reply exactly \"I don't have that information yet. Please contact Vyasa Academy directly.\" then give the phone and email once.",
    "- Never claim things about results, toppers, ratings, success rates or guarantees.",
    "- Keep answers conversational, concise, warm and easy for a class 6-12 student to read.",
    "- If a message makes a spelling or factual claim about Vyasa Academy that is not verified, politely correct it using these verified facts.",
    "- Stay on topic. If the user asks something unrelated to Vyasa Academy (a school, its courses, admissions or study material), politely explain that you can only help with Vyasa Academy topics.",
    "- Cite contact details (phone/email/hours) naturally when the user asks for them.",
    "- Use markdown only lightly: you may use plain text lists. Do not use code blocks or tables."
  ].join("\n");
}

const systemMessages = [{ role: "system", content: buildSystemPrompt() }];

/* ---------- Rate limiting (sliding window, per key) ---------- */
const buckets = new Map();
function rateLimited(key) {
  const now = Date.now();
  const arr = buckets.get(key) || [];
  const fresh = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (fresh.length >= MAX_REQUESTS_PER_WINDOW) {
    buckets.set(key, fresh);
    return true;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return false;
}

/* ---------- Input validation ---------- */
function validateMessages(raw) {
  const out = [];
  if (!Array.isArray(raw)) throw new Object.assign(new Error("messages must be an array"), { code: "BAD_REQUEST" });
  const trimmed = raw.slice(-MAX_HISTORY);
  for (const m of trimmed) {
    if (!m || typeof m !== "object") continue;
    const role = m.role === "assistant" ? "assistant" : "user";
    const content = String(m.content || "").slice(0, MAX_MESSAGE_LENGTH);
    if (content.trim()) out.push({ role, content });
  }
  return out;
}

/* ---------- Provider calls (fetch-based, no SDK) ---------- */
function fetchWithTimeout(url, options, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  options.signal = ctrl.signal;
  return fetch(url, options).finally(() => clearTimeout(timer));
}

function buildRequestBody(messages, model) {
  return { model, messages, temperature: 0.4, max_tokens: 500 };
}

async function callOpenAICompatible(messages, cfg) {
  const res = await fetchWithTimeout(
    cfg.baseUrl + "/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + cfg.apiKey
      },
      body: JSON.stringify(buildRequestBody(messages, cfg.model))
    },
    cfg.timeoutMs
  );
  if (!res.ok) {
    throw new Error("provider-http-" + res.status);
  }
  const data = await res.json();
  const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!reply || !String(reply).trim()) throw new Error("provider-empty");
  return String(reply).trim();
}

async function callOpenAIResponses(messages, cfg) {
  const res = await fetchWithTimeout(
    cfg.baseUrl + "/v1/responses",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + cfg.apiKey
      },
      body: JSON.stringify({ model: cfg.model, input: messages, temperature: 0.4, max_output_tokens: 500 })
    },
    cfg.timeoutMs
  );
  if (!res.ok) {
    throw new Error("provider-http-" + res.status);
  }
  const data = await res.json();
  const output = data && data.output;
  let reply = "";
  if (Array.isArray(output)) {
    for (const o of output) {
      if (o && o.type === "message" && Array.isArray(o.content)) {
        for (const c of o.content) {
          if (c && c.type === "output_text") reply += c.text;
        }
      }
    }
  }
  if (!reply.trim()) throw new Error("provider-empty");
  return reply.trim();
}

async function callProvider(messages, cfg, attempts) {
  for (let i = 0; i <= attempts; i++) {
    try {
      if (cfg.provider === "openai-responses") return await callOpenAIResponses(messages, cfg);
      return await callOpenAICompatible(messages, cfg);
    } catch (err) {
      const last = i === attempts;
      if (last) throw err;
    }
  }
  throw new Error("provider-unreachable");
}

/* ---------- Deterministic fallback (shared KB) ---------- */
const kbTopics = new Map();
function fallbackReply(userText, sessionId) {
  let state = { topic: null };
  if (sessionId && kbTopics.has(sessionId)) {
    state = { topic: kbTopics.get(sessionId) };
  }
  const hit = KB.answer(userText, state);
  if (hit && hit.text) {
    if (sessionId) kbTopics.set(sessionId, hit.topic || state.topic);
    return hit.text;
  }
  return FALLBACK_NOAPI;
}

/* ---------- Public handler ---------- */
async function handleChat(body, meta) {
  const cfg = getConfig();

  let messages;
  try {
    messages = validateMessages(body && body.messages);
  } catch (err) {
    return { status: 400, body: { reply: "Sorry, I could not understand that request." } };
  }
  if (!messages.length) {
    return { status: 400, body: { reply: "Sorry, I could not understand that request." } };
  }

  const sessionId = (body && typeof body.sessionId === "string")
    ? body.sessionId.slice(0, 64)
    : (meta && meta.ip) || "anon";
  if (rateLimited(sessionId)) {
    return { status: 429, body: { reply: FALLBACK_RATE } };
  }

  if (!cfg.apiKey) {
    const userText = messages[messages.length - 1].content;
    return { status: 200, body: { reply: fallbackReply(userText, sessionId), source: "knowledge" } };
  }

  const conversation = systemMessages.concat(messages);
  try {
    const reply = await callProvider(conversation, cfg, 1);
    return { status: 200, body: { reply, source: "ai" } };
  } catch (err) {
    const userText = messages[messages.length - 1].content;
    return { status: 200, body: { reply: fallbackReply(userText, sessionId), source: "knowledge" } };
  }
}

function health() {
  const cfg = getConfig();
  return {
    ok: true,
    provider: cfg.provider,
    model: cfg.model,
    aiConfigured: Boolean(cfg.apiKey),
    kbReady: typeof KB.answer === "function"
  };
}

module.exports = { handleChat, health, _internals: { rateLimited, validateMessages, callProvider, buildSystemPrompt } };