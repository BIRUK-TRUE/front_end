import axios from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const AUTH_HTTP_TIMEOUT_MS = 15_000;
const HYDRATION_TIMEOUT_MS = 2_500;

export const authHttpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: AUTH_HTTP_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

/** Routes that must not wait on hydration or refresh stale tokens first. */
export function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password')
  );
}

/** Wait until zustand persist has restored auth from localStorage. */
export function waitForAuthHydration(): Promise<void> {
  if (useAuthStore.getState().isHydrated) {
    return Promise.resolve();
  }
  if (useAuthStore.persist.hasHydrated()) {
    useAuthStore.getState().setHydrated();
    return Promise.resolve();
  }
  return Promise.race([
    new Promise<void>((resolve) => {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        unsub();
        useAuthStore.getState().setHydrated();
        resolve();
      });
    }),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        useAuthStore.getState().setHydrated();
        resolve();
      }, HYDRATION_TIMEOUT_MS);
    }),
  ]);
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(
  token: string,
  skewSeconds = 60
): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

let proactiveRefreshPromise: Promise<void> | null = null;

/** Refresh access token before API calls if JWT is expired (uses raw axios to avoid interceptors). */
export async function refreshAccessTokenIfNeeded(): Promise<void> {
  const { accessToken, refreshToken, updateTokens, clearAuth } =
    useAuthStore.getState();

  if (!refreshToken || !accessToken) return;
  if (!isAccessTokenExpired(accessToken)) return;

  if (!proactiveRefreshPromise) {
    proactiveRefreshPromise = (async () => {
      const currentRefresh = useAuthStore.getState().refreshToken;
      if (!currentRefresh) return;
      try {
        const { data } = await authHttpClient.post('/auth/refresh', {
          refresh_token: currentRefresh,
        });
        updateTokens(
          data.access_token,
          data.refresh_token ?? currentRefresh
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearAuth();
        }
      } finally {
        proactiveRefreshPromise = null;
      }
    })();
  }

  await proactiveRefreshPromise;
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const locale =
    window.location.pathname.split('/').filter(Boolean)[0] || 'en';
  const loginPath = `/${locale}/login`;
  if (window.location.pathname !== loginPath) {
    window.location.href = loginPath;
  }
}
