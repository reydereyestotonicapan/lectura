import axios from 'axios';
import { getToken, deleteToken } from '../storage/secureStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// onSignOut is set by AuthContext so we can trigger navigation on 401
let onSignOut: (() => void) | null = null;

export function setSignOutHandler(handler: () => void) {
  onSignOut = handler;
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteToken();
      onSignOut?.();
    }
    return Promise.reject(error);
  },
);

export default client;
