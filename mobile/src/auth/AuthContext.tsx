import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, deleteToken } from '../storage/secureStore';
import { setSignOutHandler } from '../api/client';
import { ApiUser } from '../types/api';

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ DEV MODE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
// Set SKIP_AUTH to true and paste your token from:
//   php artisan db:seed --class=DevTokenSeeder
// ═══════════════════════════════════════════════════════════════════════════
const SKIP_AUTH = true;
const DEV_TOKEN = '2|1EHHb5MOmhpwSiTwzZ5kPagxJdbB0w5l8KkeU1tB5eead45e'; // Paste token here, e.g., '1|abc123...'

const DEV_USER: ApiUser = {
  id: 1,
  name: 'Miguel Menchu',
  email: 'mmenchu@compassion.com',
};

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
    if (SKIP_AUTH) return; // Prevent sign out in dev mode
    await deleteToken();
    setUser(null);
    setHasToken(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (SKIP_AUTH) {
        // Dev mode: save the dev token and set authenticated state
        if (DEV_TOKEN) {
          await saveToken(DEV_TOKEN);
        }
        setUser(DEV_USER);
        setHasToken(true);
        setIsLoading(false);
        return;
      }

      // Normal mode: check for existing token
      setSignOutHandler(signOut);
      const token = await getToken();
      setHasToken(!!token);
      setIsLoading(false);
    };

    initAuth();
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
