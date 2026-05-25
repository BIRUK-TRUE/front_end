import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type {
  AttendanceSummary,
  AttendanceCalendarResponse,
  PaginatedResponse,
  AttendanceRecord,
} from '../types';

/**
 * Get student's attendance summary/stats.
 * Backend: GET /attendance/student/{student_id}/stats
 */
export function useMyAttendanceSummary() {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.attendance(studentId, { type: 'summary' }),
    queryFn: async (): Promise<AttendanceSummary> => {
      const { data } = await api.get(
        `/attendance/student/${studentId}/stats`
      );
      return {
        total_days: data?.total_days ?? 0,
        present_days: data?.present_days ?? 0,
        absent_days: data?.absent_days ?? 0,
        late_days: data?.late_days ?? 0,
        attendance_rate: data?.attendance_rate ?? 0,
        ...data,
      };
    },
    enabled: isHydrated && !!studentId,
  });
}

/**
 * Get student's attendance as calendar data.
 * Backend: GET /attendance/student/{student_id} (paginated records)
 *
 * We fetch records for the given month/year and transform into calendar format.
 */
export function useMyAttendanceCalendar(month: number, year: number) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.attendance(studentId, {
      type: 'calendar',
      month,
      year,
    }),
    queryFn: async (): Promise<AttendanceCalendarResponse> => {
      const { data } = await api.get(
        `/attendance/student/${studentId}`,
        { params: { page: 1, size: 100 } }
      );
      const items = data?.items ?? (Array.isArray(data) ? data : []);

      // Transform to calendar format — filter records for the requested month
      const days = items
        .filter((r: Record<string, unknown>) => {
          const d = new Date(r.date as string);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        })
        .map((r: Record<string, unknown>) => ({
          date: r.date as string,
          status: r.status as string,
        }));

      return { month, year, days };
    },
    enabled: isHydrated && !!studentId,
  });
}

/**
 * Get student's attendance records (paginated).
 * Backend: GET /attendance/student/{student_id}
 */
export function useMyAttendanceRecords(filters: {
  month?: number;
  year?: number;
  status?: string;
  page: number;
  size: number;
}) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.attendance(studentId, {
      type: 'records',
      ...filters,
    }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AttendanceRecord>>(
        `/attendance/student/${studentId}`,
        { params: { page: filters.page, size: filters.size } }
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}
