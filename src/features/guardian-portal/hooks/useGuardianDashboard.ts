import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { GuardianDashboardData } from '../types';

export function useGuardianDashboard() {
  const { user, isHydrated } = useAuthStore();
  const guardianId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.guardianPortal.dashboard(guardianId),
    queryFn: async () => {
      const { data } = await api.get<GuardianDashboardData>(
        `/api/guardians/${guardianId}/dashboard`
      );
      return data;
    },
    enabled: isHydrated && !!guardianId,
  });
}
