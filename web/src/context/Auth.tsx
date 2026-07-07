import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, clearToken } from "../lib/api.ts";

export type User = { id: number; name: string; email: string; avatarUrl: string };
type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => void;
};
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function refresh() {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    api.get<User>("/api/me").then(setUser).catch(() => { clearToken(); setUser(null); }).finally(() => setLoading(false));
  }
  useEffect(() => { refresh(); }, []);

  async function login(email: string, password: string) {
    const r = await api.post<{ token: string; user: User }>("/api/auth/login", { email, password });
    setToken(r.token); setUser(r.user);
  }
  function logout() { clearToken(); setUser(null); }

  return <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
