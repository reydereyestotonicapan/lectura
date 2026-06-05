import { getApps, initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBU_ndV6Tvl9VfJp72ufgvUKspmkKzDb4w',
  authDomain: 'bible-reading-quiz.firebaseapp.com',
  projectId: 'bible-reading-quiz',
  storageBucket: 'bible-reading-quiz.firebasestorage.app',
  messagingSenderId: '860937846633',
  appId: '1:860937846633:android:37f778bfbaeea5b0a3c7f8',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firebaseAuth = initializeAuth(app, { persistence: inMemoryPersistence });
export const appleProvider = new OAuthProvider('apple.com');
