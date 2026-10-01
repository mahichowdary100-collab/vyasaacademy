/* ============================================================
   Vyasa Academy Assistant - standalone Node server
   ------------------------------------------------------------
   Serves:
     POST /api/chat   -> chat with history
     GET  /api/health -> status probe
     OPTIONS          -> CORS preflight
   Run: node server.js  (PORT env, default 3000)
   ============================================================ */
"use strict";

const http = require("http");
const { handleChat, health } = require("./src/core.js");

const PORT = parseInt(process.env.PORT || "3000", 10);

function readJson(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 20000) req.destroy();
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function ipOf(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf) return xf.split(",")[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "anon";
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  const url = (req.url || "/").split("?")[0];

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "GET" && url === "/api/health") {
    const h = health();
    res.writeHead(h.aiConfigured ? 200 : 200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(h));
  }

  if (req.method === "POST" && url === "/api/chat") {
    const body = await readJson(req);
    const meta = { ip: ipOf(req) };
    const result = await handleChat(body, meta);
    res.writeHead(result.status, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(result.body));
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ reply: "Not found." }));
});

server.listen(PORT, () => {
  const h = health();
  console.log("Vyasa Academy chatbot API listening on http://localhost:" + PORT);
  console.log("Provider: " + h.provider + " | model: " + h.model + " | AI key configured: " + h.aiConfigured);
});