'use client';
import { useAuthStore } from '@/store/auth-store';

export const useAuth = () => {
  const { user, token, isAuthenticated, role, login, logout } = useAuthStore();
  return { user, token, isAuthenticated, role, login, logout };
};
