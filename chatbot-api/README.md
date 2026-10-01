# Vyasa Academy Assistant — backend / serverless endpoint

Provider-agnostic, dependency-free chat endpoint for the **Vyasa Academy Assistant**.

The website itself is a static GitHub Pages site, so it cannot run server code.
This folder is the *clearly separated* backend you deploy on any of the options
below. The frontend widget (`/chatbot/`) only ever calls **your** `/api/chat`
endpoint; it never loads an AI provider key.

## How it works

- `POST /api/chat` — body: `{ "sessionId": "...", "messages": [{role, content}, ...] }`
  → `{ "reply": "...", "source": "ai" | "knowledge" }`
- `GET /api/health` — deployment probe.
- No AI key configured → the API answers from the bundled, verified knowledge
  base (`/chatbot/chatbot-kb.js`) instead of calling any provider.
- Provider failure/rate-limit after retries → graceful fallback reply.

## Configuration (environment variables)

See `.env.example`. The important ones:

| Variable | Meaning |
| --- | --- |
| `AI_API_KEY` | Secret provider key (never put it in frontend code) |
| `AI_PROVIDER` | `openai` (chat completions, default) or `openai-responses` |
| `AI_MODEL` | Model id, e.g. `gpt-4o-mini` |
| `AI_BASE_URL` | OpenAI-compatible base URL |
| `AI_TIMEOUT_MS` | Request timeout (default 15000) |
| `PORT` | Local server port (default 3000) |

## Deploy options

### Option A — standalone Node server

```bash
AI_API_KEY=... AI_MODEL=gpt-4o-mini node server.js
```

Then point the widget to it: in `chatbot/chatbot-config.js` set
`backendUrl: "https://your-host.example.com"`.

### Option B — Vercel

Deploy this repo as a Vercel project (it has a `vercel/` directory with a
`/api/chat` function). Set the `AI_*` variables in the Vercel dashboard.
Same origin → `backendUrl: ""` works automatically.

### Option C — Cloudflare Workers

```bash
npm i -D wrangler        # or install wrangler globally
wrangler secret put AI_API_KEY   # pipe your key value in
wrangler deploy worker.js
```

Workers automatically get `worker.js` as the entrypoint when deployed from
this folder. `wrangler.toml` (create if needed):

```toml
name = "vyasa-chatbot"
main = "worker.js"
compatibility_date = "2024-01-01"
```

### Option D — Netlify / Render / Railway / any Node host

Use `server.js` as the entrypoint (Node 18+). Render/Railway/Netlify can run
it unchanged; only `PORT` env is used for the listen port.

> Note: `worker.js` and `server.js` reference sibling paths. Whatever host you
> use, make sure `src/core.js` and `../chatbot/chatbot-kb.js` deploy with the
> bundle (that is why this repo is the deployment unit, not a single file).
> The knowledge base is a plain UMD file — copy it as-is.

## Tests

```bash
node --test test/
```

Covers: intent routing, fee and off-topic honesty, factual answers, follow-up
memory, rate limiting, no-key fallback, provider adapter (against a local mock
OpenAI-compatible endpoint) and error mapping.