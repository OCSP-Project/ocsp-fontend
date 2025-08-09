'use client';
import { create } from 'zustand';

type User = { id: string; email: string } | null;
type LoginCredentials = { email: string; password: string };

interface AuthState {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
  role: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
  login: async (credentials) => {
    // Demo only: fake login
    const fakeToken = 'dev-token';
    localStorage.setItem('access_token', fakeToken);
    set({ user: { id: '1', email: credentials.email }, token: fakeToken, isAuthenticated: true, role: 'homeowner' });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false, role: null });
  },
}));
