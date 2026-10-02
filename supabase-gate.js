/* ============================================================
   Vyasa Academy - practice papers download gate
   ------------------------------------------------------------
   Requires a student to be signed in before downloading any
   practice paper asset (files under /papers/).

   Loaded AFTER supabase-auth.js (uses window.VyasaAuth).
   Uses event delegation so it also covers paper links rendered
   dynamically by script.js from papers/papers.json.

   Security: this is a front-end gate on a static site. Real
   protection of private files must happen on the host/CDN.
   ============================================================ */
(function () {
  'use strict';

  var MARK = 'vy-gate';

  function isConfigured() {
    return !!(window.VyasaAuth && window.VyasaAuth.isConfigured());
  }

  function hrefOf(a) {
    return a.getAttribute('href') || '';
  }

  // True for a paper asset link (a download target under /papers/).
  function isPaperLink(a) {
    var h = hrefOf(a);
    if (!h) return false;
    var norm = h.replace(/^\.\//, '');
    if (/papers\//i.test(norm) && /\.(pdf|docx?|pptx?|xlsx?|zip)$/i.test(h)) return true;
    var el = a;
    while (el && el !== document) {
      if (el.id === 'papersList' || (el.classList && el.classList.contains('papers-list'))) {
        return /\.(pdf|docx?|pptx?|xlsx?|zip)$/i.test(h);
      }
      el = el.parentNode;
    }
    return false;
  }

  function isModifier(e) {
    return e.ctrlKey || e.metaKey || e.shiftKey || e.altKey ||
      (typeof e.button === 'number' && e.button !== 0);
  }

  function go(url) {
    if (window.VyasaGate) window.VyasaGate.lastNav = url;
    try { window.location.assign(url); }
    catch (err) { window.location.href = url; }
  }

  function sendToLogin(path) {
    var base = (window.VYASA_SIGN_IN || '/student-sign-in/').replace(/\/?$/, '/');
    var next = base + '?next=' + encodeURIComponent(path);
    if (window.VyasaGate) window.VyasaGate.redirectedTo = next;
    go(next);
  }

  function gateClick(e) {
    if (isModifier(e) || e.defaultPrevented) return;
    var src = e.target;
    var a = (src && src.closest) ? src.closest('a') : null;
    if (!a || a.target === '_blank') return;
    if (a.origin && a.origin !== window.location.origin) return;
    if (!isPaperLink(a)) return;

    // Block the default download until we know the sign-in state.
    e.preventDefault();
    var raw;
    try { raw = decodeURIComponent(a.pathname || ''); }
    catch (err) { raw = a.pathname || ''; }
    var target = raw || hrefOf(a);

    if (!isConfigured()) {
      // Auth not enabled yet: keep the download working as before.
      go(a.href);
      return;
    }

    window.VyasaAuth.currentUser().then(function (user) {
      if (user) go(a.href);
      else sendToLogin(target);
    }).catch(function () {
      go(a.href);
    });
  }

  if (document.documentElement.hasAttribute(MARK)) return;
  document.documentElement.setAttribute(MARK, '1');
  document.addEventListener('click', gateClick, true);
  window.VyasaGate = window.VyasaGate || {};
})();