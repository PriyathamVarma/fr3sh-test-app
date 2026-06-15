import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, UserProfile } from '@/services/api';

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (user: UserProfile, token?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('fr_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          const res = await authApi.me();
          const raw = res.user ?? res.data;
          if (res.success && raw) {
            const serverUser: UserProfile = { ...raw, id: raw.id ?? (raw as any)._id?.toString() };
            setUser(serverUser);
            await AsyncStorage.setItem('fr_user', JSON.stringify(serverUser));
          }
        }
      } catch {
        // not authenticated
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (u: UserProfile, token?: string) => {
    setUser(u);
    await AsyncStorage.setItem('fr_user', JSON.stringify(u));
    if (token) await AsyncStorage.setItem('fr_token', token);
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.multiRemove(['fr_user', 'fr_token']);
    try { await authApi.logout(); } catch { /* ignore */ }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem('fr_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
