'use client';

import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from '@tanstack/react-query';
import { useAuthReady } from '@/hooks/use-auth-ready';

/**
 * useQuery wrapper — waits for auth before fetching (avoids pre-hydration 401s and stuck loading).
 */
export function useAuthenticatedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) {
  const authReady = useAuthReady();
  const userEnabled = options.enabled ?? true;

  return useQuery({
    ...options,
    enabled: authReady && userEnabled,
  });
}
