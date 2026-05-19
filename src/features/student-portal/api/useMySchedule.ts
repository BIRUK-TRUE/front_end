import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { ScheduleResponse } from '../types';

export function useMySchedule(weekOffset: number = 0) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.schedule(studentId, weekOffset),
    queryFn: async () => {
      // GET /students/{student_id}/schedule returns schedule derived from enrollment
      const { data } = await api.get<ScheduleResponse>(
        `/students/${studentId}/schedule`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}
