'use client';

import { useAuthStore } from '@/lib/store/auth-store';

/** True when persisted auth is loaded or user just logged in (in-memory). */
export function getAuthReady(): boolean {
  const { isHydrated, user, accessToken } = useAuthStore.getState();
  return isHydrated || Boolean(user && accessToken);
}

export function useAuthReady(): boolean {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  return isHydrated || Boolean(user && accessToken);
}
