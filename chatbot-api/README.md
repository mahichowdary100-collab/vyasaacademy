# Vyasa Guru - Gemini Chatbot Backend

Serverless API for the Vyasa Guru chatbot powered by Google Gemini.

## Structure
- api/chat.js - Vercel serverless function
- vercel/api/chat.js - alternative Vercel structure
- src/core.js - shared core (Gemini integration + KB fallback)
- server.js - local dev server

## Environment Variables
Set in Vercel Project Settings > Environment Variables:
- GEMINI_API_KEY (required) - server-side only
- GEMINI_MODEL (optional) - default gemini-2.5-flash

## Local Development
1. cd chatbot-api
2. copy .env.example to .env and set GEMINI_API_KEY
3. node server.js
4. test http://localhost:3000/api/health

## Deployment (Vercel)
1. Create Vercel project and connect this repo
2. Set Root Directory to chatbot-api (if deploying from monorepo)
3. Add GEMINI_API_KEY and GEMINI_MODEL to Environment Variables
4. Deploy - API will be at https://YOUR-PROJECT.vercel.app/api/chat
5. Update chatbot/chatbot-config.js backendUrl to that URL
6. Rebuild/push GitHub Pages

## CORS
Allowed origins: https://vyasaacademy.in, https://www.vyasaacademy.in