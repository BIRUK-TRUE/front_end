'use client';

import { useEffect } from 'react';
import {
  waitForAuthHydration,
  refreshAccessTokenIfNeeded,
} from '@/lib/auth/session';
import { syncAuthCookies, useAuthStore } from '@/lib/store/auth-store';

/**
 * Runs once on app load: restore auth from localStorage and refresh expired access tokens
 * before dashboard queries fire.
 */
export function AuthBootstrap() {
  useEffect(() => {
    void (async () => {
      const isAuthPage = /\/(login|forgot-password|reset-password)(\/|$)/.test(
        window.location.pathname
      );
      await waitForAuthHydration();
      useAuthStore.getState().setHydrated();
      const { user, accessToken } = useAuthStore.getState();
      if (user && accessToken) {
        syncAuthCookies(user, accessToken);
        if (!isAuthPage) {
          await refreshAccessTokenIfNeeded();
        }
      }
    })();
  }, []);

  return null;
}
