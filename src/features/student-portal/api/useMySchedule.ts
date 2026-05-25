import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { ScheduleResponse } from '../types';

/**
 * Get student's class schedule.
 *
 * The backend doesn't have /students/{id}/schedule.
 * We chain: enrollment lookup → section_id → /schedule/section/{section_id}
 */
export function useMySchedule(weekOffset: number = 0) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.schedule(studentId, weekOffset),
    queryFn: async (): Promise<ScheduleResponse> => {
      try {
        // Step 1: Get student's current enrollment to find section
        const { data: enrollments } = await api.get(
          `/enrollments/student/${studentId}`
        );
        const items = enrollments?.items ?? (Array.isArray(enrollments) ? enrollments : []);
        const activeEnrollment = items.find(
          (e: Record<string, unknown>) => e.status === 'active'
        );

        if (!activeEnrollment?.section_id) {
          return { entries: [], section_id: '', section_name: '' };
        }

        // Step 2: Fetch the schedule for this section
        const { data: schedule } = await api.get(
          `/schedule/section/${activeEnrollment.section_id}`
        );

        return {
          entries: Array.isArray(schedule) ? schedule : (schedule?.entries ?? []),
          section_id: activeEnrollment.section_id,
          section_name: activeEnrollment.section_name ?? '',
        };
      } catch {
        return { entries: [], section_id: '', section_name: '' };
      }
    },
    enabled: isHydrated && !!studentId,
  });
}
