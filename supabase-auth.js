// ============================================================
// Vyasa Academy - shared Supabase auth layer (frontend)
//
// Security notes:
//  - The browser cannot be the only gate: it never is here.
//    Every private read goes through Supabase Row Level Security
//    (see supabase/schema.sql), so a forged client session gets
//    nothing. This file only decides the UI route to show.
//  - SESSION TOKENS: end-to-end encryption & httpOnly cookies are
//    not possible on static GitHub Pages hosting. We store the
//    Supabase session token (JWT) in sessionStorage when "Remember
//    me" is off and localStorage when it is on. Any data fetch still
//    requires the token AND a matching RLS row. Revocation happens
//    server-side via Supabase Auth.
// ============================================================
(function () {
  'use strict';

  var STORAGE_KEY = 'vyasa-academy-auth-token';
  var ROLE_DASH = {
    student: '/student-dashboard/',
    parent: '/parent-dashboard/',
    admin: '/admin-dashboard/'
  };
  var _client = null;

  function isConfigured() {
    var c = window.AUTH_CONFIG;
    return !!(
      c && c.url && c.anonKey &&
      /^https:\/\//.test(c.url) &&
      c.anonKey !== 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE'
    );
  }

  function hasKey(storage) {
    try { return !!storage.getItem(STORAGE_KEY); } catch (e) { return false; }
  }

  // Pick the storage that holds an existing session (honours "remember me").
  function pickStorage() {
    try {
      if (hasKey(window.sessionStorage)) return window.sessionStorage;
    } catch (e) { /* ignore */ }
    return window.localStorage;
  }

  function createClient(storage) {
    if (!window.supabase || !isConfigured()) return null;
    var s = storage || pickStorage();
    return window.supabase.createClient(
      window.AUTH_CONFIG.url,
      window.AUTH_CONFIG.anonKey,
      {
        auth: {
          storageKey: STORAGE_KEY,
          storage: s,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }

  function getClient(storage) {
    if (_client) return _client;
    _client = createClient(storage);
    return _client;
  }

  // getUser() re-validates the token against the server, unlike
  // getSession() which trusts the local copy.
  function currentUser() {
    var c = getClient();
    if (!c) return Promise.reject(new Error('NOT_CONFIGURED'));
    return c.auth.getUser().then(function (r) {
      if (r.error) return null;
      return r.data.user;
    });
  }

  function fetchProfile() {
    var c = getClient();
    if (!c) return Promise.reject(new Error('NOT_CONFIGURED'));
    return currentUser().then(function (user) {
      if (!user) return null;
      return c.from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle()
        .then(function (r) {
          if (r.error) return null;
          return r.data;
        });
    });
  }

  function dashFor(role) {
    return ROLE_DASH[role] || '/login/';
  }

  function redirect(url) {
    // replace() prevents a back-button return to the previous page.
    window.location.replace(url);
  }

  // Guard a private page. requiredRole is enforced against the
  // server-side profiles row, never client input.
  function guard(opts) {
    opts = opts || {};
    if (!isConfigured()) {
      return Promise.reject(new Error('NOT_CONFIGURED'));
    }
    var here = window.location.pathname;
    var isAuthPage = /\/login\/?$/.test(here) ||
      /\/forgot-password\/?$/.test(here) ||
      /\/reset-password\/?$/.test(here);
    var next = new URLSearchParams(window.location.search).get('next') || '';
    return currentUser().then(function (user) {
      if (!user) {
        // Avoid churning redirects when already on an auth page.
        var target = '/login/';
        if (!isAuthPage) {
          target += '?next=' + encodeURIComponent(next || here);
        }
        redirect(target);
        return null;
      }
      return fetchProfile().then(function (profile) {
        if (!profile || !ROLE_DASH[profile.role]) {
          // Signed in but no valid local role = not part of the portal.
          return getClient().auth.signOut().then(function () {
            redirect('/login/?next=' + encodeURIComponent(here));
            return null;
          });
        }
        if (opts.requiredRole && profile.role !== opts.requiredRole) {
          redirect(dashFor(profile.role));
          return null;
        }
        return { user: user, profile: profile };
      });
    });
  }

  function logout() {
    var c = getClient();
    if (!c) return Promise.reject(new Error('NOT_CONFIGURED'));
    return c.auth.signOut().then(function () {
      try { window.sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      redirect('/login/');
    });
  }

  // Surface a "not configured yet" banner on any page calling this.
  function showNotConfigured(el) {
    if (el) {
      el.classList.remove('hidden');
      el.textContent =
        'Login is not configured yet. The academy administrator must add the ' +
        'Supabase project URL and anon key to supabase-config.js.';
    }
  }

  window.VyasaAuth = {
    isConfigured: isConfigured,
    getClient: getClient,
    currentUser: currentUser,
    fetchProfile: fetchProfile,
    guard: guard,
    logout: logout,
    dashFor: dashFor,
    ROLE_DASH: ROLE_DASH,
    showNotConfigured: showNotConfigured,
    STORAGE_KEY: STORAGE_KEY
  };
})();