// src/lib/auth/auth.api.ts
import apiClient from '../api/client';
import type { LoginData, RegisterData, ForgotPasswordData, AuthTokens } from '@/hooks/useAuth';

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export const authApi = {
  // Login
  login: async (data: LoginData): Promise<AuthTokens> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  // Verify Email
  verifyEmail: async (data: { email: string; token: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },
// auth.api.ts
resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },
  // Reset Password
  resetPassword: async (data: { token: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Revoke Token
  revokeToken: async (refreshToken: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/revoke-token', { refreshToken });
    return response.data;
  },

  // Google OAuth (for future implementation)
  googleLogin: async (credential: string): Promise<AuthTokens> => {
    const response = await apiClient.post('/auth/google', { credential });
    return response.data;
  }
};