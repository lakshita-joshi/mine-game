const API_BASE = import.meta.env.VITE_API_URL||"http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // sends the httpOnly JWT cookie
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

/**
 * Real backend calls, matching routes/minesRoutes.js.
 * Not yet wired into useMinesGame — see that hook's comments for
 * where to swap the mock logic for these.
 */
export const minesApi = {
  start: ({ stake, gridSize, mineCount, clientSeed }) =>
    request("/api/mines/start", {
      method: "POST",
      body: { stake, gridSize, mineCount, clientSeed },
    }),

  reveal: ({ sessionId, tileIndex }) =>
    request("/api/mines/reveal", {
      method: "POST",
      body: { sessionId, tileIndex },
    }),

  cashOut: ({ sessionId }) =>
    request("/api/mines/cashout", {
      method: "POST",
      body: { sessionId },
    }),

  getSession: (id) => request(`/api/mines/${id}`),
};

export const authApi = {
  me: () => request("/api/auth/me"),
  register: ({ username, email, password }) =>
    request("/api/auth/register", { method: "POST", body: { username, email, password } }),
  login: ({ username, password }) =>
    request("/api/auth/login", { method: "POST", body: { username, password } }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
};

export const adminApi = {
  getStats: () => request("/api/admin/stats"),
  listUsers: ({ search = "", page = 1, limit = 20 } = {}) =>
    request(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`),
  getUser: (id) => request(`/api/admin/users/${id}`),
  updateUser: (id, body) => request(`/api/admin/users/${id}`, { method: "PATCH", body }),
  listSessions: ({ status = "", gameType = "", page = 1, limit = 20 } = {}) =>
    request(`/api/admin/sessions?status=${status}&gameType=${gameType}&page=${page}&limit=${limit}`),
};

export const walletApi = {
  claimDaily: () => request("/api/wallet/claim-daily", { method: "POST" }),
  balance: () => request("/api/wallet/balance"),
};