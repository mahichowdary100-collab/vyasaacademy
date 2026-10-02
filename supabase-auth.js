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
    return fetchProfileFull().then(function (p) {
      if (!p) return null;
      return { role: p.role, full_name: p.full_name };
    });
  }

  // Full student profile row (single select, RLS-protected).
  // Includes role so callers can route, plus the student fields.
  function fetchProfileFull() {
    var c = getClient();
    if (!c) return Promise.reject(new Error('NOT_CONFIGURED'));
    return currentUser().then(function (user) {
      if (!user) return null;
      return c.from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(function (r) {
          if (r.error) return null;
          return r.data;
        });
    });
  }

  // Guarantee a profiles row exists for a signed-in user (used when
  // an OAuth sign-up arrives before the auth trigger is installed,
  // or as defence in depth). Always inserts role 'student'.
  function ensureProfile(user) {
    var c = getClient();
    if (!c) return Promise.reject(new Error('NOT_CONFIGURED'));
    var u = user || null;
    return (u ? Promise.resolve(u) : currentUser()).then(function (usr) {
      if (!usr) return null;
      var meta = usr.user_metadata || {};
      return c.from('profiles')
        .select('id')
        .eq('id', usr.id)
        .maybeSingle()
        .then(function (r) {
          if (r.error) return null;
          if (r.data) return r.data;
          return c.from('profiles')
            .insert({
              id: usr.id,
              role: 'student',
              full_name: meta.full_name || meta.name || usr.email || 'Student',
              email: usr.email || null,
              avatar_url: meta.avatar_url || meta.picture || meta.avatar || null
            })
            .select('*')
            .single()
            .then(function (ins) {
              if (ins.error) return null;
              return ins.data;
            });
        });
    });
  }

  // Update the STUDENT's own profile. role/id are stripped on the
  // client as well as on the server (RLS with-check + column grant).
  function updateProfile(patch) {
    var c = getClient();
    if (!c) return Promise.reject(new Error('NOT_CONFIGURED'));
    var allowed = {};
    var keys = ['full_name', 'email', 'avatar_url', 'mobile_number',
      'class_level', 'board', 'school_name', 'parent_name', 'parent_mobile'];
    var p = patch || {};
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (typeof p[k] !== 'undefined') allowed[k] = p[k];
    }
    return currentUser().then(function (user) {
      if (!user) return null;
      return c.from('profiles')
        .update(allowed, { returning: 'representation' })
        .eq('id', user.id)
        .select('*')
        .single()
        .then(function (r) {
          if (r.error) throw new Error('PROFILE_UPDATE_FAILED');
          return r.data;
        });
    });
  }

  // Google OAuth sign-in. redirectTo should be a page that runs
  // supabase-auth (e.g. the student dashboard) so the PKCE session
  // from the URL is stored and validated there.
  function signInWithGoogle(redirectTo) {
    var c = getClient();
    if (!c) return Promise.reject(new Error('NOT_CONFIGURED'));
    return c.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo || defaultRedirect() }
    });
  }

  // Phone (OTP) sign-in. Requires the Phone provider + SMS
  // configuration (Twilio) in the Supabase dashboard. `phone` is an
  // E.164 string e.g. "+919494901006".
  function signInWithPhone(phone, redirectTo) {
    var c = getClient();
    if (!c) return Promise.reject(new Error('NOT_CONFIGURED'));
    return c.auth.signInWithOtp({
      phone: phone,
      options: { shouldCreateUser: true }
    });
  }

  function defaultRedirect() {
    return window.location.origin + '/student-dashboard/';
  }

  // Normalised auth-state listener. cb(state, user, profile):
  //   state: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'INITIAL_SESSION'
  function onAuthChange(cb) {
    var c = getClient();
    if (!c) return function () {};
    var sub = c.auth.onAuthStateChange(function (event, session) {
      var state = (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED')
        ? event : 'SIGNED_OUT';
      var user = (session && session.user) ? session.user : null;
      if (user && event === 'INITIAL_SESSION') state = 'INITIAL_SESSION';
      cb(state, user);
    });
    return function () {
      try { sub.data.subscription.unsubscribe(); } catch (e) { /* ignore */ }
    };
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
      return fetchProfileFull().then(function (profile) {
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
    fetchProfileFull: fetchProfileFull,
    ensureProfile: ensureProfile,
    updateProfile: updateProfile,
    signInWithGoogle: signInWithGoogle,
    signInWithPhone: signInWithPhone,
    onAuthChange: onAuthChange,
    defaultRedirect: defaultRedirect,
    guard: guard,
    logout: logout,
    dashFor: dashFor,
    ROLE_DASH: ROLE_DASH,
    showNotConfigured: showNotConfigured,
    STORAGE_KEY: STORAGE_KEY
  };
})();