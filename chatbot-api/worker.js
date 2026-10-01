/* Vyasa Academy Assistant - Cloudflare Worker
   Deploy with `wrangler publish` and bind the AI_* secrets:
     wrangler secret put AI_API_KEY  (pipe the value)
   Worker route for /api/chat and /api/health. */
"use strict";

const { handleChat, health } = require("./src/core.js");

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return new Response(JSON.stringify(health()), { status: 200, headers: { "Content-Type": "application/json", ...cors } });
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      let body = {};
      try {
        body = await request.json();
      } catch (err) { /* leave empty */ }
      const result = await handleChat(body, { ip: request.headers.get("CF-Connecting-IP") || "anon" });
      return new Response(JSON.stringify(result.body), { status: result.status, headers: { "Content-Type": "application/json", ...cors } });
    }

    return new Response(JSON.stringify({ reply: "Not found." }), { status: 404, headers: { "Content-Type": "application/json", ...cors } });
  }
};