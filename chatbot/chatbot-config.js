/* ============================================================
   Vyasa Guru - Frontend configuration
   ------------------------------------------------------------
   No API keys, no provider credentials. The browser only ever
   talks to OUR chat endpoint; provider keys stay server-side.

   backendUrl options:
     - "" (default): try same-origin "/api/chat" (works when the
       backend is hosted on the same domain, e.g. a Vercel/Netlify
       function or a reverse proxy).
     - "https://your-backend.example.com": a fully separate
       serverless/self-hosted endpoint.
   When the backend is unreachable, the widget automatically uses
   the built-in deterministic knowledge base (chatbot-kb.js).
   ============================================================ */
window.VYASA_CHATBOT_CONFIG = {
  backendUrl: "",

  avatarUrl: "/chatbot/vyasa-guru-avatar.png",

  tipText: "Chat with Vyasa Guru",

  headerTitle: "Vyasa Guru",
  subtitle: "Ask me about courses, admissions, classes and study material.",

  buttonAriaLabel: "Open Vyasa Guru chat",
  closeAriaLabel: "Close Vyasa Guru chat",
  sendAriaLabel: "Send message",
  clearAriaLabel: "Clear conversation",
  inputPlaceholder: "Type your question...",

  quickPrompts: [
    "Which classes do you offer?",
    "What subjects do you teach?",
    "How can I join Vyasa Academy?",
    "Where is Vyasa Academy located?",
    "What Class 10 study material is available?",
    "How can I contact Vyasa Academy?"
  ],

  backendTimeoutMs: 15000,
  maxMessageLength: 1000,
  maxHistoryMessages: 12,
  maxRetry: 1
};