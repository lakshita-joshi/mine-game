import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/minesApi.js";

const AuthContext = createContext(null);

/**
 * "status" values:
 *   loading        - checking for an existing session on first load
 *   authenticated  - user is set, safe to render protected routes
 *   unauthenticated - no valid session, ProtectedRoute redirects to /login
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await authApi.me();
      setUser(user);
      setStatus("authenticated");
      return user;
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  // On first mount, check whether a valid session cookie already exists
  // (e.g. the user refreshed the page while logged in).
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (username, password) => {
    const { user } = await authApi.login({ username, password });
    setUser(user);
    setStatus("authenticated");
    return user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { user } = await authApi.register({ username, email, password });
    setUser(user);
    setStatus("authenticated");
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  // Lets game screens optimistically update the displayed balance
  // right after a start/reveal/cashout response, without a full
  // re-fetch of /me.
  const setCoins = useCallback((coins) => {
    setUser((u) => (u ? { ...u, coins } : u));
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, refreshUser, setCoins }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
