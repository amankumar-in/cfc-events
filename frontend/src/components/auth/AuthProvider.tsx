"use client";

import { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getToken, setToken, clearToken } from "@/lib/auth/token";
import { getMe } from "@/lib/api/auth";
import type { User, AuthContextValue } from "@/lib/auth/auth-context";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setTokenState(storedToken);
      getMe(storedToken)
        .then((res) => {
          setUser(res ?? null);
        })
        .catch(() => {
          clearToken();
          setTokenState(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (jwt: string) => {
    setToken(jwt);
    setTokenState(jwt);
    const me = await getMe(jwt);
    setUser(me ?? null);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
