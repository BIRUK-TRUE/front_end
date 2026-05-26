import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { ScheduleResponse } from '../types';

export function useMySchedule(_weekOffset: number = 0) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.schedule(studentId, _weekOffset),
    queryFn: async (): Promise<ScheduleResponse> => {
      const { data } = await api.get(`/students/${studentId}/schedule`);
      return {
        schedule: Array.isArray(data?.schedule) ? data.schedule : [],
      };
    },
    enabled: isHydrated && !!studentId,
  });
}
