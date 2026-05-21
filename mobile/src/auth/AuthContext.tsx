import React, { createContext, useContext, useEffect, useState } from 'react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { getToken, saveToken, deleteToken } from '../storage/secureStore';
import { setSignOutHandler } from '../api/client';
import { firebaseAuth } from '../firebase';
import { ApiUser } from '../types/api';

// Lazy load Google Sign-In to avoid crashes in Expo Go
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  // Running in Expo Go
}

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ DEV MODE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
// Set SKIP_AUTH to true and paste your token from:
//   php artisan db:seed --class=DevTokenSeeder
// ═══════════════════════════════════════════════════════════════════════════
const SKIP_AUTH = false;
const DEV_TOKEN = '2|1EHHb5MOmhpwSiTwzZ5kPagxJdbB0w5l8KkeU1tB5eead45e'; // Paste token here, e.g., '1|abc123...'

const DEV_USER: ApiUser = {
  id: 1,
  name: 'Miguel Menchu',
  email: 'mmenchu@compassion.com',
};

interface AuthState {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  signIn: (token: string, user: ApiUser) => Promise<void>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  setUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const enterGuestMode = () => setIsGuest(true);
  const exitGuestMode = () => setIsGuest(false);

  const signOut = async () => {
    if (SKIP_AUTH) return; // Prevent sign out in dev mode
    setIsGuest(false);
    
    // Sign out from Google Sign-In (clears cached account)
    if (GoogleSignin) {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore errors if not signed in with Google
      }
    }
    
    // Sign out from Firebase
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (e) {
      // Ignore errors if not signed in with Firebase
    }
    
    // Clear app token
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
      value={{ user, isAuthenticated: hasToken, isGuest, isLoading, signIn, signOut, enterGuestMode, exitGuestMode, setUser }}
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
