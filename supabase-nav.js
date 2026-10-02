/* ============================================================
   Vyasa Academy - header authentication widget (public pages)
   ------------------------------------------------------------
   Injects a "Sign In" button or the signed-in student's
   avatar + dropdown into the existing site nav on any page.

   Renders inside whatever nav-links container the page already
   has (works with <ul class="nav-links">, <nav class="nav-links">
   and the auth portals' <ul id="authNavLinks">). It never edits
   the rest of the page markup.

   Requires (loaded once per page, right before this file):
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="/supabase-config.js"></script>
     <script src="/supabase-auth.js"></script>
     <script src="/supabase-nav.js" defer></script>

   Security: this file only decides UI. All data reads go through
   Row Level Security; tokens stay in the client created by
   supabase-auth.js. No secrets here.
   ============================================================ */
(function () {
  'use strict';

  var MARK = 'data-vy-nav';

  function ready(cb) {
    if (document.readyState !== 'loading') { cb(); return; }
    document.addEventListener('DOMContentLoaded', cb);
  }

  function host() {
    var c = document.getElementById('navLinks') ||
      document.getElementById('authNavLinks') ||
      document.querySelector('.nav-links');
    return c || null;
  }

  function isListContainer(el) {
    return el && el.tagName === 'UL';
  }

  function clearEl(container) {
    var prev = container.querySelector('[' + MARK + '="1"]');
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
  }

  function buildSignedIn(profile) {
    var name = (profile && profile.full_name) || 'Student';
    var avatar = (profile && profile.avatar_url) || '';
    var initial = (name.trim().charAt(0) || 'S').toUpperCase();

    var wrap = document.createElement(isListContainer(host()) ? 'li' : 'div');
    wrap.setAttribute(MARK, '1');
    wrap.className = 'vy-nav-auth';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vy-nav-account';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Account menu for ' + name);

    var av = document.createElement('span');
    av.className = 'vy-nav-avatar';
    if (avatar) {
      av.style.backgroundImage = 'url("' + String(avatar).replace(/"/g, '%22') + '")';
    }
    av.textContent = avatar ? '' : initial;

    var nm = document.createElement('span');
    nm.className = 'vy-nav-name';
    nm.textContent = name.split(' ')[0];

    var caret = document.createElement('i');
    caret.className = 'fas fa-chevron-down';
    caret.setAttribute('aria-hidden', 'true');

    btn.appendChild(av);
    btn.appendChild(nm);
    btn.appendChild(caret);

    var menu = document.createElement('div');
    menu.className = 'vy-nav-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Student menu');

    var items = [
      { label: 'My Profile', icon: 'fa-user', href: '/student-dashboard/?view=profile', onclick: null },
      { label: 'My Study Materials', icon: 'fa-book-open', href: '/cbse-study-material/', onclick: null },
      { label: 'My Tests', icon: 'fa-file-alt', href: '/student-dashboard/?view=tests', onclick: null },
      { label: 'My Results', icon: 'fa-chart-line', href: '/student-dashboard/?view=results', onclick: null },
      { label: 'Attendance', icon: 'fa-calendar-check', href: '/student-dashboard/?view=attendance', onclick: null },
      { label: 'Vyasa AI', icon: 'fa-robot', href: null, onclick: openChatbot },
      { label: 'Sign Out', icon: 'fa-sign-out-alt', href: null, onclick: signOut }
    ];

    items.forEach(function (it) {
      var a = document.createElement('a');
      a.className = 'vy-nav-menu-item';
      a.setAttribute('role', 'menuitem');
      var i = document.createElement('i');
      i.className = 'fas ' + it.icon;
      i.setAttribute('aria-hidden', 'true');
      a.appendChild(i);
      var s = document.createElement('span');
      s.textContent = it.label;
      a.appendChild(s);
      if (it.href) a.href = it.href;
      if (it.onclick) a.addEventListener('click', function (e) { e.preventDefault(); closeMenu(); it.onclick(); });
      menu.appendChild(a);
    });

    function openMenu() {
      var open = menu.classList.toggle('vy-nav-menu--open');
      btn.setAttribute('aria-expanded', String(open));
    }
    function closeMenu() {
      menu.classList.remove('vy-nav-menu--open');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openMenu();
    });
    wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () { closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    return wrap;
  }

  function signInUrl() {
    return window.VYASA_SIGN_IN || '/student-sign-in/';
  }

  function buildSignedOut() {
    var wrap = document.createElement(isListContainer(host()) ? 'li' : 'div');
    wrap.setAttribute(MARK, '1');
    wrap.className = 'vy-nav-auth-signedout';
    var a = document.createElement('a');
    a.className = 'vy-nav-signin';
    a.href = signInUrl();
    a.setAttribute('aria-label', 'Student Sign In');
    var i = document.createElement('i');
    i.className = 'fas fa-graduation-cap';
    i.setAttribute('aria-hidden', 'true');
    a.appendChild(i);
    var s = document.createElement('span');
    s.textContent = 'Student Sign In';
    a.appendChild(s);
    wrap.appendChild(a);
    return wrap;
  }

  function openChatbot() {
    try {
      if (window.VyasaAssistant && window.VyasaAssistant.open) window.VyasaAssistant.open();
      else window.location.href = '/';
    } catch (e) { window.location.href = '/'; }
  }

  function signOut() {
    if (!window.VyasaAuth) { window.location.href = signInUrl(); return; }
    window.VyasaAuth.logout().catch(function () {
      window.location.replace(signInUrl());
    });
  }

  function render() {
    var c = host();
    if (!c) return;
    clearEl(c);
    if (!window.VyasaAuth || !window.VyasaAuth.isConfigured()) {
      // Auth not configured yet: still point students at the login page,
      // which will explain what is needed.
      c.appendChild(buildSignedOut());
      return;
    }
    window.VyasaAuth.ensureProfile()
      .then(function (profile) {
        if (!profile) {
          c.appendChild(buildSignedOut());
          return;
        }
        c.appendChild(buildSignedIn(profile));
      })
      .catch(function () {
        c.appendChild(buildSignedOut());
      });
  }

  ready(function () {
    render();
    if (window.VyasaAuth && window.VyasaAuth.isConfigured()) {
      window.VyasaAuth.onAuthChange(function (state) { render(); });
    }
  });
})();