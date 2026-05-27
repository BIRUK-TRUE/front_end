import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { GuardianDashboardData } from '../types';

/**
 * Guardian dashboard hook.
 *
 * Fetches comprehensive dashboard data from the backend including:
 * - Children with full details (class, section, attendance, grades, fees)
 * - Recent alerts and notifications
 */
export function useGuardianDashboard() {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const guardianId = user?.guardian_id ?? '';

  return useQuery({
    queryKey: queryKeys.guardianPortal.dashboard(guardianId),
    queryFn: async (): Promise<GuardianDashboardData> => {
      // Fetch guardian dashboard with all computed data
      const { data } = await api.get(`/guardians/${guardianId}/dashboard`);
      return data;
    },
    enabled: authReady && !!guardianId,
  });
}
