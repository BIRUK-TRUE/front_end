import { useQuery } from '@tantml:react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { ChildSummary } from '../types';

export function useMyChildren() {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const guardianId = user?.guardian_id ?? '';

  return useQuery({
    queryKey: queryKeys.guardianPortal.children(guardianId),
    queryFn: async (): Promise<ChildSummary[]> => {
      // Fetch guardian dashboard which includes full child details
      const { data } = await api.get(`/guardians/${guardianId}/dashboard`);
      return data.children ?? [];
    },
    enabled: authReady && !!guardianId,
  });
}
