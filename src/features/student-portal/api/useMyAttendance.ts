import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type {
  AttendanceSummary,
  AttendanceCalendarResponse,
  PaginatedResponse,
  AttendanceRecord,
} from '../types';

export function useMyAttendanceSummary() {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.attendance(studentId, { type: 'summary' }),
    queryFn: async (): Promise<AttendanceSummary> => {
      const { data } = await api.get(`/students/${studentId}/attendance/summary`);
      return {
        totalDays: data?.totalDays ?? 0,
        present: data?.present ?? 0,
        absent: data?.absent ?? 0,
        late: data?.late ?? 0,
        excused: data?.excused ?? 0,
        attendanceRate: data?.attendanceRate ?? 0,
      };
    },
    enabled: authReady && !!studentId,
  });
}

export function useMyAttendanceCalendar(month: number, year: number) {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.attendance(studentId, {
      type: 'calendar',
      month,
      year,
    }),
    queryFn: async (): Promise<AttendanceCalendarResponse> => {
      const { data } = await api.get(`/students/${studentId}/attendance/calendar`, {
        params: { month, year },
      });
      return { records: data?.records ?? [] };
    },
    enabled: authReady && !!studentId,
  });
}

export function useMyAttendanceRecords(filters: {
  month?: number;
  year?: number;
  status?: string;
  page: number;
  size: number;
}) {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.attendance(studentId, {
      type: 'records',
      ...filters,
    }),
    queryFn: async (): Promise<PaginatedResponse<AttendanceRecord>> => {
      const { data } = await api.get(`/students/${studentId}/attendance/records`, {
        params: {
          page: filters.page,
          size: filters.size,
          month: filters.month,
          year: filters.year,
          status: filters.status,
        },
      });
      return data;
    },
    enabled: authReady && !!studentId,
  });
}
