import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { ChildDetails } from '../types';
import type { AttendanceRecord, PaginatedResponse } from '../../student-portal/types';

export function useChildDetails(studentId: string) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.childDetails(studentId),
    queryFn: async () => {
      const { data } = await api.get<ChildDetails>(
        `/api/students/${studentId}/guardian-view`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useChildAttendance(studentId: string, filters: any) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.attendance(studentId, filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AttendanceRecord>>(
        `/api/students/${studentId}/attendance/records`,
        { params: filters }
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useChildGrades(studentId: string, filters: any) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.grades(studentId, filters),
    queryFn: async () => {
      const { data } = await api.get(
        `/api/students/${studentId}/grades`,
        { params: filters }
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useChildSchedule(studentId: string) {
  const { isHydrated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.guardianPortal.schedule(studentId),
    queryFn: async () => {
      const { data } = await api.get(
        `/api/students/${studentId}/schedule`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}
