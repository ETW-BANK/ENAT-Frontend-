import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../lib/api";
import type { AuthResponse } from "../lib/api";

interface AuthState {
  user: AuthResponse | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  setUser: (u: AuthResponse) => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthResponse | null>(() => {
    const raw = localStorage.getItem("enat_user");
    return raw ? JSON.parse(raw) : null;
  });

  const setUser = (u: AuthResponse) => {
    setUserState(u);
    localStorage.setItem("enat_user", JSON.stringify(u));
    localStorage.setItem("enat_token", u.token);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setUser(res);
    return res;
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem("enat_user");
    localStorage.removeItem("enat_token");
  };

  useEffect(() => {
    if (!user) return;
    const ms = new Date(user.expiresAt).getTime() - Date.now();
    if (ms <= 0) { logout(); return; }
    const timer = setTimeout(logout, ms);
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <AuthCtx.Provider value={{ user, isAdmin: !!user?.roles?.includes("Admin"), login, logout, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}