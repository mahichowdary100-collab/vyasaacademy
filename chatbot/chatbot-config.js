/* Vyasa Guru - Frontend configuration */
window.VYASA_CHATBOT_CONFIG = {
  backendUrl: "https://YOUR-VERCEL-PROJECT.vercel.app/api/chat",
  avatarUrl: "/chatbot/vyasa-guru-avatar.png",
  tipText: "Chat with Vyasa Guru",
  headerTitle: "VYASA GURU",
  subtitle: "Your AI Learning Companion",
  buttonAriaLabel: "Open Vyasa Guru chat",
  closeAriaLabel: "Close Vyasa Guru chat",
  sendAriaLabel: "Send message",
  clearAriaLabel: "Clear conversation",
  inputPlaceholder: "Ask Vyasa Guru anything...",
  quickPrompts: [
    "Find My Course",
    "Study Material",
    "Maths Help",
    "Science Help",
    "Practice & Quizzes",
    "Admissions"
  ],
  welcomeHtml: "<p>👋 Namaste! I'm Vyasa Guru.</p><p>Your AI learning companion from Vyasa Academy.</p><p>Ask me about Maths, Science, CBSE study material, quizzes, courses, or admissions.</p>",
  showTipOnLoad: true,
  backendTimeoutMs: 15000,
  maxMessageLength: 1000,
  maxHistoryMessages: 12,
  maxRetry: 1
};