import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, deleteToken } from '../storage/secureStore';
import { setSignOutHandler } from '../api/client';
import { ApiUser } from '../types/api';

interface AuthState {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string, user: ApiUser) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = async () => {
    await deleteToken();
    setUser(null);
    setHasToken(false);
  };

  useEffect(() => {
    setSignOutHandler(signOut);
    getToken().then((token) => {
      setHasToken(!!token);
      setIsLoading(false);
    });
  }, []);

  const signIn = async (token: string, userData: ApiUser) => {
    await saveToken(token);
    setHasToken(true);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: hasToken, isLoading, signIn, signOut, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
