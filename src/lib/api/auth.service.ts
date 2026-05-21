import { axiosInstance } from './axios';
import { useAuthStore } from '@/lib/store/auth-store';

// ============================================================
// Auth service — uses real API only (no mock fallback)
// ============================================================
export const authService = {
  async login(email: string, password: string) {
    console.log('[AuthService] Sending login request to:', `${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
    const { data } = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    console.log('[AuthService] Login response received:', data);
    return data;
  },

  async refresh(refreshToken: string) {
    const { data } = await axiosInstance.post('/auth/refresh', {
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
    const { data } = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    return data;
  },

  async resetPassword(
    token: string,
    newPassword: string,
    newPasswordConfirm: string
  ) {
    const { data } = await axiosInstance.post('/auth/reset-password', {
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
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
