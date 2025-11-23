// src/services/auth.service.ts
import apiClient from '@/lib/api/client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'homeowner' | 'contractor' | 'supervisor';
}

export interface ForgotPasswordData {
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthTokens> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (data: { email: string; token: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: { token: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};
