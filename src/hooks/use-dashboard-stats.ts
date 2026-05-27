'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';

export interface DashboardStats {
  users: { total: number; active: number; inactive: number; growth: number };
  students: { total: number; active: number; growth: number };
  teachers: { total: number; active: number; growth: number };
  guardians: { total: number; active: number };
}

/**
 * Fetches all admin dashboard stat counts in a single HTTP request.
 * Backend runs every COUNT concurrently so latency ≈ slowest query.
 */
export function useDashboardStats() {
  const authReady = useAuthReady();

  return useQuery<DashboardStats>({
    queryKey: queryKeys.analytics.dashboardStats,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/analytics/dashboard-stats');
      return data;
    },
    enabled: authReady,
    staleTime: 5 * 60 * 1000,   // 5 min — counts don't change every second
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}
