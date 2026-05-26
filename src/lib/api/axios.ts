/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Concurrency control for token refresh
let refreshPromise: Promise<any> | null = null;

// Request interceptor: attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 with token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept 401s from the login endpoint — let the caller handle them
    if (originalRequest?.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          // Get current locale from localStorage or default to 'en'
          const locale =
            window.location.pathname.split('/').filter(Boolean)[0] || 'en';
          window.location.href = `/${locale}/login`;
        }
        return Promise.reject(error);
      }

      try {
        // Use existing refresh promise if one is in progress (concurrency control)
        if (!refreshPromise) {
          refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
        }

        const { data } = await refreshPromise;
        refreshPromise = null; // Clear after successful refresh

        const store = useAuthStore.getState();
        store.updateTokens(
          data.access_token,
          data.refresh_token ?? store.refreshToken ?? '',
        );
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        // Only force logout when refresh is rejected (expired/invalid token), not on network blips
        const refreshRejected =
          axios.isAxiosError(refreshError) &&
          refreshError.response?.status === 401;
        if (refreshRejected) {
          useAuthStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            const locale =
              window.location.pathname.split('/').filter(Boolean)[0] || 'en';
            window.location.href = `/${locale}/login`;
          }
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
