/* Vyasa Academy Assistant - Vercel serverless function
   Deploy this repo as a Vercel Function at /api/chat.
   Set the AI_* environment variables in the Vercel dashboard. */
"use strict";

const { handleChat, health } = require("../src/core");

function ipOf(req) {
  const xf = req.headers && req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf) return xf.split(",")[0].trim();
  return req.headers && req.headers["x-real-ip"] ? req.headers["x-real-ip"] : "anon";
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET" && (req.url || "/").split("?")[0] === "/api/health") {
    return res.status(200).json(health());
  }

  if (req.method === "POST" && (req.url || "/").split("?")[0] === "/api/chat") {
    const result = await handleChat(req.body || {}, { ip: ipOf(req) });
    return res.status(result.status).json(result.body);
  }

  return res.status(404).json({ reply: "Not found." });
};