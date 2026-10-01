/* ============================================================
   Vyasa Guru - widget
   ------------------------------------------------------------
   Renders the floating launcher + chat dialog. Talks ONLY to
   our backend endpoint (/api/chat or configured backendUrl).
   If the backend is unreachable it falls back to the bundled
   deterministic knowledge base (chatbot-kb.js) so visitors
   always get an answer.
   No API keys are ever loaded in the browser.
   ============================================================ */
(function () {
  "use strict";

  var KB = (typeof window !== "undefined" && window.VyasaChatbotKB) ? window.VyasaChatbotKB : null;
  var CONFIG = (typeof window !== "undefined" && window.VYASA_CHATBOT_CONFIG) ? window.VYASA_CHATBOT_CONFIG : {};
  var BACKEND_URL = CONFIG.backendUrl || "/api/chat";
  var TIMEOUT_MS = CONFIG.backendTimeoutMs || 15000;
  var MAX_LEN = CONFIG.maxMessageLength || 1000;
  var MAX_HISTORY = CONFIG.maxHistoryMessages || 12;
  var MAX_RETRY = CONFIG.maxRetry || 1;

  var localStorageKey = "vy-chat-kb-topic";
  var sessionKey = "vy-chat-session";
  var kbState = { topic: null };
  var lastScrollY = 0;

  function getSessionId() {
    try {
      var cur = sessionStorage.getItem(sessionKey);
      if (cur) return cur;
      var id = "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(sessionKey, id);
      return id;
    } catch (e) { /* ignore */ }
    return "s-anon";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function svgIcon(name) {
    var icons = {
      launcher: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 10h-4v4h-4v-4H6V6h4V2h4v4h4v4z"/></svg>',
      bot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a2 2 0 0 1 2 2 2 2 0 0 1 0 4s4 0 4 4c0 3-2 4-4 4h-2c-2 0-4-1-4-4 0-4 4-4 4-4a2 2 0 0 1 0-4 2 2 0 0 1 2-2zm-2 9v-1H8v1h2zm4 0h2v-1h-2v1zm-2 3h2v-2h-2v2z"/></svg>',
      close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z"/></svg>',
      clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM8 9h8v10H8V9zm6.5-5-1-1h-5l-1 1H5v2h14V4h-4.5z"/></svg>',
      send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21 23 12 2 3l.4 7 14.6 2-14.6 2L2 21z"/></svg>'
    };
    return icons[name] || "";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function linkify(html) {
    return html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  function toBotReply(text) {
    var node = el("div", "vy-chat-msg vy-chat-msg--bot focus-fn");
    node.innerHTML = linkify(escapeHtml(text));
    node.tabIndex = 0;
    return node;
  }
  function toUserMsg(text) {
    var node = el("div", "vy-chat-msg vy-chat-msg--user");
    node.textContent = text;
    return node;
  }
  function toErrorMsg(text) {
    var node = el("div", "vy-chat-msg vy-chat-msg--error");
    node.innerHTML = linkify(escapeHtml(text));
    return node;
  }

  function toTyping() {
    var node = el("div", "vy-chat-msg vy-chat-msg--bot");
    node.setAttribute("aria-live", "polite");
    node.innerHTML = '<span class="vy-chat-typing"><span></span><span></span><span></span></span>';
    return node;
  }

  var widget = {
    launcher: null,
    window: null,
    body: null,
    input: null,
    sendBtn: null,
    open: false,
    busy: false,
    started: false,
    history: []
  };

  function baseUrl() {
    return (typeof VYASA_BASE_URL !== "undefined" && VYASA_BASE_URL) ? VYASA_BASE_URL : "";
  }

  function callBackend(messages) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    var url = BACKEND_URL.indexOf("http") === 0 ? BACKEND_URL : baseUrl() + BACKEND_URL;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getSessionId(), messages: messages }),
      signal: ctrl.signal
    }).then(function (resp) {
      clearTimeout(timer);
      if (!resp.ok) {
        throw new Error("backend-http-" + resp.status);
      }
      return resp.json();
    }).then(function (data) {
      if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("backend-empty");
      }
      return data.reply.trim();
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  function send(message) {
    if (widget.busy) return;
    var text = String(message || "").trim();
    if (!text) return;
    if (text.length > MAX_LEN) {
      text = text.slice(0, MAX_LEN);
    }

    var role = "user";
    widget.history.push({ role: role, content: text });
    if (widget.history.length > MAX_HISTORY * 2) {
      widget.history = widget.history.slice(widget.history.length - MAX_HISTORY * 2);
    }

    appendMsg(toUserMsg(text));
    widget.input.value = "";
    resizeInput();

    var typing = appendMsg(toTyping());
    widget.busy = true;
    setSendState();

    var historyForBackend = widget.history.slice(-MAX_HISTORY);

    var attempt = function (remaining) {
      return callBackend(historyForBackend).then(
        function (reply) {
          replaceTyping(typing, toBotReply(reply));
        },
        function () {
          if (remaining > 0) return attempt(remaining - 1);
          throw new Error("backend-unreachable");
        }
      );
    };

    attempt(MAX_RETRY).then(
      function () { finish(); },
      function (err) {
        var local = null;
        if (KB) {
          local = KB.answer(text, kbState);
          if (local && local.topic) {
            kbState.topic = local.topic;
            try { localStorage.setItem(localStorageKey, local.topic); } catch (e) { /* ignore */ }
          }
        }
        replaceTyping(typing, local && local.text
          ? toBotReply("Vyasa Guru is temporarily busy. Please try again in a few minutes.\n\nIn the meantime: " + local.text)
          : toBotReply("Vyasa Guru is temporarily busy. Please try again in a few minutes."));
        finish();
      }
    );

    function finish() {
      widget.busy = false;
      setSendState();
      scrollBottom();
    }
  }

  function onAskChip(text) {
    if (!widget.input) return;
    widget.input.value = text;
    send(text);
  }

  function onClick(e) {
    if (widget.busy) return;
    if (typeof e.preventDefault === "function") e.preventDefault();
    send(e.currentTarget.dataset.ask || e.currentTarget.textContent || "");
  }

  /* ---------- DOM helpers ---------- */
  function appendMsg(node) {
    widget.body.appendChild(node);
    scrollBottom();
    return node;
  }
  function replaceTyping(typing, replacement) {
    if (typing && typing.parentNode) {
      typing.parentNode.replaceChild(replacement, typing);
    } else {
      widget.body.appendChild(replacement);
    }
  }
  function scrollBottom() {
    if (widget.body) widget.body.scrollTop = widget.body.scrollHeight;
  }

  function resizeInput() {
    if (!widget.input) return;
    widget.input.style.height = "auto";
    widget.input.style.height = Math.min(widget.input.scrollHeight, 96) + "px";
  }

  function setSendState() {
    if (!widget.sendBtn) return;
    widget.sendBtn.disabled = widget.busy;
  }

  /* ---------- Quick prompts ---------- */
  function buildQuickPromptsRow() {
    var prompts = CONFIG.quickPrompts || [];
    if (!prompts.length) return null;
    var wrap = el("div", "vy-chat-asks");
    wrap.setAttribute("aria-label", "Suggested questions");
    for (var i = 0; i < prompts.length; i++) {
      var b = el("button", "vy-chat-ask", prompts[i]);
      b.type = "button";
      b.dataset.ask = prompts[i];
      b.addEventListener("click", onClick);
      wrap.appendChild(b);
    }
    return wrap;
  }

  function showGreeting() {
    var greeting = "Hi! I am Vyasa Guru. You can ask about our classes (VI - XII), subjects, admissions, contact details or the free CBSE study material. Pick a question below or type your own.";
    if (!KB || !KB.FACTS) {
      greeting = "Hi! I am Vyasa Guru. Ask me about courses, admissions or study material.";
    }
    var bot = toBotReply(greeting);
    appendMsg(bot);
    var row = buildQuickPromptsRow();
    if (row) appendMsg(row);
  }

  /* ---------- Open / close ---------- */
  function openChat() {
    if (!widget.started) {
      widget.started = true;
      showGreeting();
    }
    widget.open = true;
    widget.window.hidden = false;
    setLauncherVisible(true);
    syncLauncherState();
    widget.launcher.setAttribute("aria-expanded", "true");
    widget.launcher.setAttribute("aria-label", CONFIG.closeAriaLabel || "Close Vyasa Guru chat");
    try {
      var stored = localStorage.getItem(localStorageKey);
      if (stored && !kbState.topic) kbState.topic = stored;
    } catch (e) { /* ignore */ }
    widget.body.scrollTop = widget.body.scrollHeight;
    setTimeout(function () {
      widget.input.focus();
    }, 30);
  }

  function closeChat() {
    widget.open = false;
    widget.window.hidden = true;
    syncLauncherState();
    widget.launcher.setAttribute("aria-expanded", "false");
    widget.launcher.setAttribute("aria-label", CONFIG.buttonAriaLabel || "Open Vyasa Guru chat");
    widget.launcher.focus();
    updateLauncherVisibility();
  }

  function toggleChat() {
    if (widget.open) closeChat(); else openChat();
  }

  function clearChat() {
    widget.history = [];
    kbState.topic = null;
    try { localStorage.removeItem(localStorageKey); } catch (e) { /* ignore */ }
    widget.body.innerHTML = "";
    showGreeting();
  }

  /* ---------- Scroll-aware launcher ---------- */
  function setLauncherVisible(show) {
    if (!widget.launcher) return;
    var cls = "vy-chat-launcher--hidden";
    if (show || widget.open) widget.launcher.classList.remove(cls);
    else widget.launcher.classList.add(cls);
  }

  function getScroll() {
    var doc = document.documentElement;
    var y = window.pageYOffset || doc.scrollTop || 0;
    var maxScroll = Math.max(0, (doc.scrollHeight - window.innerHeight));
    return { y: y, maxScroll: maxScroll };
  }

  function updateLauncherVisibility() {
    if (widget.open) { setLauncherVisible(true); return; }
    var s = getScroll();
    if (s.maxScroll <= 0) { setLauncherVisible(true); return; }
    var scrollingDown = (s.y - lastScrollY) > 2;
    var nearFooter = (s.y >= s.maxScroll - 220);
    lastScrollY = s.y;
    setLauncherVisible(!scrollingDown && !nearFooter);
  }

  function syncLauncherState() {
    var open = widget.open;
    if (widget.launcher) {
      widget.launcher.classList.toggle("vy-chat-launcher--open", open);
      widget.launcher.innerHTML = open ? svgIcon("close") : launcherMedia();
    }
    if (widget.window) widget.window.classList.toggle("vy-chat-window--raised", open);
  }

  function onLauncherScroll(e) { updateLauncherVisibility(); }
  function onLauncherResize(e) { updateLauncherVisibility(); }

  /* ---------- Keyboard ---------- */
  function onKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (widget.input && widget.input.value.trim()) send(widget.input.value);
    }
  }
  function onWindowKeydown(e) {
    if (e.key === "Escape" && widget.open) {
      e.preventDefault();
      closeChat();
    }
  }

  function onDocClick(e) {
    if (!widget.open) return;
    var t = e.target;
    while (t && t !== document.body) {
      if (t === widget.window || t === widget.launcher) return;
      t = t.parentNode;
    }
    closeChat();
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function avatarMedia() {
    if (CONFIG.avatarUrl) return '<img class="vy-chat-avatar-img" src="' + escapeAttr(CONFIG.avatarUrl) + '" alt="" aria-hidden="true">';
    return svgIcon("bot");
  }

  function launcherMedia() {
    if (CONFIG.avatarUrl) return '<img class="vy-chat-avatar-img" src="' + escapeAttr(CONFIG.avatarUrl) + '" alt="" aria-hidden="true">';
    return svgIcon("launcher");
  }

  /* ---------- Build ---------- */
  function buildDOM() {
    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "vy-chat-launcher vy-chat-focus-btn";
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-label", CONFIG.buttonAriaLabel || "Open Vyasa Guru chat");
    launcher.innerHTML = launcherMedia();

    var win = document.createElement("div");
    win.className = "vy-chat-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-modal", "true");
    win.setAttribute("aria-label", CONFIG.headerTitle || "Vyasa Guru");
    win.hidden = true;

    var header = el("div", "vy-chat-header");
    var avatar = el("div", "vy-chat-avatar");
    avatar.innerHTML = avatarMedia();
    var headtext = el("div", "vy-chat-headtext");
    headtext.appendChild(el("p", "vy-chat-title", CONFIG.headerTitle || "Vyasa Guru"));
    headtext.appendChild(el("p", "vy-chat-subtitle", CONFIG.subtitle || ""));
    var clearBtn = el("button", "vy-chat-clear vy-chat-focus-btn");
    clearBtn.type = "button";
    clearBtn.setAttribute("aria-label", CONFIG.clearAriaLabel || "Clear conversation");
    clearBtn.innerHTML = svgIcon("clear");
    var closeBtn = el("button", "vy-chat-close vy-chat-focus-btn");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", CONFIG.closeAriaLabel || "Close chat");
    closeBtn.innerHTML = svgIcon("close");

    header.appendChild(avatar);
    header.appendChild(headtext);
    header.appendChild(clearBtn);
    header.appendChild(closeBtn);

    var body = el("div", "vy-chat-body");
    body.setAttribute("role", "log");
    body.setAttribute("aria-live", "polite");

    var footer = el("div", "vy-chat-footer");
    var input = document.createElement("textarea");
    input.className = "vy-chat-input";
    input.rows = 1;
    input.setAttribute("placeholder", CONFIG.inputPlaceholder || "Type your question...");
    input.setAttribute("aria-label", CONFIG.inputPlaceholder || "Type your question...");
    input.setAttribute("maxlength", String(MAX_LEN));
    var sendBtn = el("button", "vy-chat-send vy-chat-focus-btn");
    sendBtn.type = "button";
    sendBtn.setAttribute("aria-label", CONFIG.sendAriaLabel || "Send message");
    sendBtn.innerHTML = svgIcon("send");

    footer.appendChild(input);
    footer.appendChild(sendBtn);

    var note = el("p", "vy-chat-note", "");
    note.innerHTML = 'Vyasa Guru answers from verified Vyasa Academy information. For fee details, call <a href="tel:+919494901006">+91 94949 01006</a>.';

    win.appendChild(header);
    win.appendChild(body);
    win.appendChild(footer);
    win.appendChild(note);

    widget.launcher = launcher;
    widget.window = win;
    widget.body = body;
    widget.input = input;
    widget.sendBtn = sendBtn;

    launcher.addEventListener("click", toggleChat);
    closeBtn.addEventListener("click", closeChat);
    clearBtn.addEventListener("click", clearChat);
    sendBtn.addEventListener("click", function () { if (input.value.trim()) send(input.value); });
    input.addEventListener("keydown", onKeydown);
    input.addEventListener("input", resizeInput);
    window.addEventListener("keydown", onWindowKeydown);
    document.addEventListener("click", onDocClick);
    window.addEventListener("scroll", onLauncherScroll, { passive: true });
    window.addEventListener("resize", onLauncherResize, { passive: true });

    (document.body || document.documentElement).appendChild(launcher);
    (document.body || document.documentElement).appendChild(win);
    lastScrollY = getScroll().y;
    updateLauncherVisibility();
  }

  function init() {
    if (document.body) {
      destroy();
      buildDOM();
    } else {
      document.addEventListener("DOMContentLoaded", init);
    }
  }

  function destroy() {
    window.removeEventListener("scroll", onLauncherScroll);
    window.removeEventListener("resize", onLauncherResize);
    if (widget.window && widget.window.parentNode) widget.window.parentNode.removeChild(widget.window);
    if (widget.launcher && widget.launcher.parentNode) widget.launcher.parentNode.removeChild(widget.launcher);
    widget.launcher = null;
    widget.window = null;
    widget.body = null;
    widget.input = null;
    widget.sendBtn = null;
    widget.open = false;
    widget.busy = false;
    widget.started = false;
    widget.history = [];
    lastScrollY = 0;
  }

  window.VyasaAssistant = { init: init, destroy: destroy, open: openChat, close: closeChat };
  init();
})();