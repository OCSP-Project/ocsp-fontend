
'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/auth/auth.api';

export interface LoginData {
  email: string;
  password: string;
}

// Role enum to match backend
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
  confirmPassword: string; // Required by backend
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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // TODO: Validate token with backend
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    try {
      const response = await authApi.login(data);
      
      // Store tokens and user data
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      await authApi.register(data);
      // After successful registration, user needs to verify email
      // Don't auto-login, redirect to login with success message
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const forgotPassword = async (data: ForgotPasswordData): Promise<void> => {
    try {
      await authApi.forgotPassword(data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email');
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to home or login page
    window.location.href = '/';
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshToken);
      
      // Update tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
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
    checkAuthStatus
  };
};