// src/hooks/useAuth.ts - Enhanced version
'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/auth/auth.api';
import { signalRClient } from '@/lib/websocket/signalr-client';

export interface LoginData {
  email: string;
  password: string;
}

export enum UserRole {
  Admin = 0,
  Supervisor = 1,
  Contractor = 2,
  Homeowner = 3
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface ForgotPasswordData {
  email: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null;
  user: User;
}

// Event to broadcast auth state changes across components
const AUTH_STATE_CHANGE_EVENT = 'auth-state-change';

// Broadcast auth state change
const broadcastAuthChange = (authData: { user: User | null; isAuthenticated: boolean }) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { 
      detail: authData 
    }));
  }
};

// Utility functions for token management
const tokenManager = {
  setTokens: (tokens: AuthTokens) => {
    try {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('expiresAt', tokens.expiresAt);
      localStorage.setItem('user', JSON.stringify(tokens.user));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  },

  getTokens: (): StoredTokens | null => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const expiresAt = localStorage.getItem('expiresAt');
      const userStr = localStorage.getItem('user');
      
      if (!accessToken || !refreshToken || !userStr) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresAt,
        user: JSON.parse(userStr) as User
      };
    } catch (error) {
      console.error('Error reading tokens:', error);
      return null;
    }
  },

  clearTokens: () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('expiresAt');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  isTokenExpired: (expiresAt?: string | null): boolean => {
    if (!expiresAt) return true;
    try {
      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = Date.now();
      // Add 5 minutes buffer
      return currentTime >= (expirationTime - 5 * 60 * 1000);
    } catch (error) {
      return true;
    }
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    console.log('Auth state changed:', { user, isAuthenticated, isLoading });
  }, [user, isAuthenticated, isLoading]);

  // Update state and broadcast changes
  const updateAuthState = useCallback((newUser: User | null, authenticated: boolean) => {
    setUser(newUser);
    setIsAuthenticated(authenticated);
    broadcastAuthChange({ user: newUser, isAuthenticated: authenticated });
  }, []);

  // Listen for auth state changes from other components
  useEffect(() => {
    const handleAuthStateChange = (event: CustomEvent) => {
      const { user: eventUser, isAuthenticated: eventAuth } = event.detail;
      setUser(eventUser);
      setIsAuthenticated(eventAuth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange as EventListener);
      return () => {
        window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange as EventListener);
      };
    }
  }, []);

  // Initialize auth state from localStorage
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const tokens = tokenManager.getTokens();
      
      if (!tokens) {
        updateAuthState(null, false);
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (tokenManager.isTokenExpired(tokens.expiresAt)) {
        console.log('Token expired, attempting refresh...');
        
        try {
          const newTokens = await authApi.refreshToken(tokens.refreshToken);
          tokenManager.setTokens(newTokens);
          updateAuthState(newTokens.user, true);
          
          // Connect to notification hub
          try {
            await signalRClient.connectToNotifications(newTokens.user.id);
          } catch (notificationError) {
            console.warn('Failed to connect to notification hub:', notificationError);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          tokenManager.clearTokens();
          updateAuthState(null, false);
        }
      } else {
        // Token is still valid
        updateAuthState(tokens.user, true);
        
        // Connect to notification hub
        try {
          await signalRClient.connectToNotifications(tokens.user.id);
        } catch (notificationError) {
          console.warn('Failed to connect to notification hub:', notificationError);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      tokenManager.clearTokens();
      updateAuthState(null, false);
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  // Check auth status on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (data: LoginData): Promise<void> => {
    try {
      
      setIsLoading(true);
      const response = await authApi.login(data);
      
      // Store tokens and user data
      tokenManager.setTokens(response);
      
      // Update state and broadcast immediately
      updateAuthState(response.user, true);
      
      // Connect to notification hub
      try {
        await signalRClient.connectToNotifications(response.user.id);
        
        // Request notification permission
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (notificationError) {
        console.warn('Failed to connect to notification hub:', notificationError);
      }
      
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      await authApi.register(data);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const forgotPassword = async (data: ForgotPasswordData): Promise<void> => {
    try {
      await authApi.forgotPassword(data);
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email');
    }
  };

  const logout = useCallback(() => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Clear tokens
      tokenManager.clearTokens();
      
      // Update state and broadcast
      updateAuthState(null, false);
      
      // Optional: Call API to revoke tokens
      if (refreshToken) {
        authApi.revokeToken(refreshToken).catch(console.error);
      }
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [updateAuthState]);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const tokens = tokenManager.getTokens();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(tokens.refreshToken);
      
      // Update tokens
      tokenManager.setTokens(response);
      updateAuthState(response.user, true);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    forgotPassword,
    logout,
    refreshToken,
    checkAuthStatus: initializeAuth
  };
};