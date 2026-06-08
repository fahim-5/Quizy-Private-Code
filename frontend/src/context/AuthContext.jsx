import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // On mount, if token exists load current user
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      try {
        const res = await api.get("/users/me");
        if (!mounted) return;
        const data = res.data.data || res.data;
        setUser(data || null);
      } catch (e) {
        // token invalid or fetch failed — clear
        setUser(null);
        setToken(null);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData, authToken) => {
    setUser(userData || null);
    if (authToken) {
      // Persist token immediately to avoid race condition with requests
      try {
        localStorage.setItem("token", authToken);
      } catch (e) {}
      setToken(authToken);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
