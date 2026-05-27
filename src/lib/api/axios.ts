/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  waitForAuthHydration,
  redirectToLogin,
  isPublicAuthRequest,
  authHttpClient,
} from '@/lib/auth/session';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,  // Increased to 60s for slow queries
  headers: {
    'Content-Type': 'application/json',
  },
});

// Concurrency control for token refresh
let refreshPromise: Promise<any> | null = null;

// Request interceptor: wait for persisted auth, refresh if needed, attach token
axiosInstance.interceptors.request.use(
  async (config) => {
    const url = config.url ?? '';
    if (!isPublicAuthRequest(url)) {
      await waitForAuthHydration();
    }

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

      await waitForAuthHydration();

      const refreshToken = useAuthStore.getState().refreshToken;
      const isHydrated = useAuthStore.getState().isHydrated;

      // Never wipe session while auth is still loading from localStorage (common on HMR/navigation)
      if (!refreshToken) {
        if (isHydrated) {
          useAuthStore.getState().clearAuth();
          redirectToLogin();
        }
        return Promise.reject(error);
      }

      try {
        // Use existing refresh promise if one is in progress (concurrency control)
        if (!refreshPromise) {
          refreshPromise = authHttpClient.post('/auth/refresh', {
            refresh_token: refreshToken,
          });
        }

        const { data } = await refreshPromise;
        refreshPromise = null;

        const store = useAuthStore.getState();
        store.updateTokens(
          data.access_token,
          data.refresh_token ?? store.refreshToken ?? '',
        );
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshPromise = null; // always release lock (timeout/network/401)
        const refreshRejected =
          axios.isAxiosError(refreshError) &&
          refreshError.response?.status === 401;
        if (refreshRejected && useAuthStore.getState().isHydrated) {
          useAuthStore.getState().clearAuth();
          redirectToLogin();
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
