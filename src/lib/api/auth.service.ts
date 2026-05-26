import { axiosInstance } from './axios';
import { authClient } from './auth-client';
import { authHttpClient } from '@/lib/auth/session';
import { useAuthStore } from '@/lib/store/auth-store';

// ============================================================
// Auth service — uses real API only (no mock fallback)
// ============================================================
export const authService = {
  async login(email: string, password: string) {
    const { data } = await authClient.post('/auth/login', {
      email,
      password,
    });
    return data;
  },

  async refresh(refreshToken: string) {
    const { data } = await authHttpClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ) {
    const { data } = await axiosInstance.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPasswordConfirm,
    });
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await authClient.post('/auth/forgot-password', {
      email,
    });
    return data;
  },

  async resetPassword(
    token: string,
    newPassword: string,
    newPasswordConfirm: string
  ) {
    const { data } = await authClient.post('/auth/reset-password', {
      token,
      new_password: newPassword,
      confirm_password: newPasswordConfirm,
    });
    return data;
  },

  async getCurrentUser() {
    const { data } = await axiosInstance.get('/auth/me');
    return data;
  },

  async verifyToken() {
    const { data } = await axiosInstance.get('/auth/verify');
    return data;
  },

  logout() {
    useAuthStore.getState().clearAuth();
  },
};
