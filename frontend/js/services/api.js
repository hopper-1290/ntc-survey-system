/**
 * Central fetch wrapper used by every service module.
 * If the frontend is served by the backend itself (server.js serves
 * /frontend as static files), relative "/api/..." calls just work.
 * If you host the frontend separately, set window.NTC_API_BASE_URL
 * (e.g. in a small inline <script> before this file loads) to point
 * at the backend's origin, e.g. "http://localhost:4000".
 */

const API_BASE_URL = window.NTC_API_BASE_URL || "";
const TOKEN_KEY = "ntc_admin_token";
const USER_KEY = "ntc_admin_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Session expired / invalid — bounce admin pages back to login
  if (res.status === 401 && auth) {
    clearSession();
    if (window.location.pathname.includes("/admin/") &&
        !window.location.pathname.endsWith("login.html")) {
      window.location.href = "login.html";
    }
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

window.NtcApi = { apiRequest, getToken, setSession, clearSession, getCurrentUser };
