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

export function useMyAttendanceSummary() {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.attendance(studentId, { type: 'summary' }),
    queryFn: async () => {
      const { data } = await api.get<AttendanceSummary>(
        `/students/${studentId}/attendance/summary`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useMyAttendanceCalendar(month: number, year: number) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.attendance(studentId, {
      type: 'calendar',
      month,
      year,
    }),
    queryFn: async () => {
      const { data } = await api.get<AttendanceCalendarResponse>(
        `/students/${studentId}/attendance/calendar`,
        { params: { month, year } }
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

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
        `/students/${studentId}/attendance/records`,
        { params: filters }
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}
