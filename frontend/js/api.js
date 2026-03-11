/**
 * api.js
 * Centralised HTTP client for all PitBros backend requests.
 * Reads JWT from localStorage and attaches Bearer header automatically.
 */

const API_BASE = 'http://127.0.0.1:5000/api';

const api = (() => {
  async function request(method, path, body = null, requiresAuth = true) {
    const headers = { 'Content-Type': 'application/json' };

    if (requiresAuth) {
      const token = localStorage.getItem('pb_access_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body !== null) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, options);
    let data = {};
    try { data = await res.json(); } catch (_) { /* empty body */ }

    if (!res.ok) {
      const msg = data.error || data.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  return {
    get:    (path, auth = true)         => request('GET',    path, null, auth),
    post:   (path, body = {}, auth = true) => request('POST',   path, body, auth),
    put:    (path, body = {}, auth = true) => request('PUT',    path, body, auth),
    delete: (path, auth = true)         => request('DELETE', path, null, auth),
    patch:  (path, body = {}, auth = true) => request('PATCH',  path, body, auth),
  };
})();

// Make globally available
window.api = api;
