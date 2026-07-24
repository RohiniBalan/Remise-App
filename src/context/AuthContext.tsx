import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage, StoredUser } from '../utils/storage';

// Ported from client/app/context/AuthContext.js. Web's `authChange`/`storage`
// event dance exists only to sync multiple browser tabs/components that
// bypass React state and write localStorage directly — RN has a single JS
// runtime and no tabs, so every mutation goes through login()/logout()
// directly below and every consumer re-renders from context state alone;
// no event emitter is needed (see plan's Auth-state section).

interface AuthContextValue {
  user: StoredUser | null;
  token: string | null;
  loading: boolean;
  login: (userData: StoredUser, authToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<StoredUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedToken, storedUser] = await Promise.all([storage.getToken(), storage.getUser()]);
      setToken(storedToken);
      setUser(storedUser);
      setLoading(false);
      // Matches web's `NavbarHome.tsx` cleanup of the legacy `accessToken` key.
      storage.clearLegacyAccessToken();
    })();
  }, []);

  const login = useCallback(async (userData: StoredUser, authToken: string) => {
    await Promise.all([storage.setUser(userData), storage.setToken(authToken)]);
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([storage.removeUser(), storage.removeToken()]);
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback(async (patch: Partial<StoredUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      storage.setUser(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
