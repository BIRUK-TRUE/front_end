import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { ScheduleResponse } from '../types';

export function useMySchedule() {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.schedule(studentId),
    queryFn: async () => {
      const { data } = await api.get<ScheduleResponse>(
        `/api/students/${studentId}/schedule`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}
