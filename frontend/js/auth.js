/**
 * auth.js
 * Manages authentication state: storing/reading JWT tokens and user info,
 * login/logout helpers, and route guards.
 */

const auth = (() => {
  const KEYS = {
    token:   'pb_access_token',
    refresh: 'pb_refresh_token',
    user:    'pb_user',
  };

  function getUser() {
    try { return JSON.parse(localStorage.getItem(KEYS.user) || 'null'); }
    catch { return null; }
  }

  function getToken() { return localStorage.getItem(KEYS.token); }

  function isLoggedIn() { return !!getToken(); }

  function isAdmin() { return getUser()?.role === 'admin'; }

  function save(data) {
    localStorage.setItem(KEYS.token, data.access_token);
    if (data.refresh_token) localStorage.setItem(KEYS.refresh, data.refresh_token);
    localStorage.setItem(KEYS.user, JSON.stringify(data.user));
  }

  function logout() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    window.location.href = 'user_login.html';
  }

  /**
   * Redirect if not logged in.
   * @param {boolean} adminOnly - Also require admin role
   * @returns {boolean} true if allowed to proceed
   */
  function requireAuth(adminOnly = false) {
    if (!isLoggedIn()) {
      window.location.href = adminOnly ? 'admin_login.html' : 'user_login.html';
      return false;
    }
    if (adminOnly && !isAdmin()) {
      window.location.href = 'admin_login.html';
      return false;
    }
    return true;
  }

  /** Redirect if already authenticated (for login pages). */
  function redirectIfLoggedIn(dest = 'user_landing.html') {
    if (isLoggedIn()) {
      window.location.href = isAdmin() ? 'admin_account.html' : dest;
    }
  }

  return { getUser, getToken, isLoggedIn, isAdmin, save, logout, requireAuth, redirectIfLoggedIn };
})();

window.auth = auth;
