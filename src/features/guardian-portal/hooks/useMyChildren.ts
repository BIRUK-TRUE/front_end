import { useQuery } from '@tanstack/react-query';
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
    queryFn: async () => {
      const { data } = await api.get<ChildSummary[]>(
        `/guardians/${guardianId}/students`
      );
      return data;
    },
    enabled: authReady && !!guardianId,
  });
}
