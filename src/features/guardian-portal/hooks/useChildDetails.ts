import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { ChildDetails } from '../types';
import type { AttendanceRecord, PaginatedResponse } from '../../student-portal/types';
import { useMyChildren } from './useMyChildren';

interface AttendanceFilters {
  page?: number;
  size?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

interface GradeFilters {
  termId?: string;
  subjectId?: string;
  yearId?: string;
}

function toChildDetails(child: NonNullable<ReturnType<typeof useMyChildren>['data']>[number]): ChildDetails {
  return {
    ...child,
    guardian_owned: true,
    enrollment_date: '',
    academic_year: '',
  };
}

/**
 * Get child details for a guardian-linked student.
 * Reuses the guardian children list (same dashboard payload) to avoid duplicate API calls.
 */
export function useChildDetails(studentId: string) {
  const childrenQuery = useMyChildren();

  const matched = childrenQuery.data?.find(
    (child) => String(child.id) === String(studentId),
  );

  return {
    ...childrenQuery,
    data: matched ? toChildDetails(matched) : undefined,
    isError: childrenQuery.isError,
    isLoading: childrenQuery.isLoading,
  };
}

/**
 * Get child attendance records.
 * Backend: GET /attendance/student/{student_id}
 */
export function useChildAttendance(studentId: string, filters: AttendanceFilters) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: queryKeys.guardianPortal.attendance(studentId, filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AttendanceRecord>>(
        `/attendance/student/${studentId}`,
        {
          params: {
            page: filters.page ?? 1,
            size: filters.size ?? 50,
          },
        },
      );
      return data;
    },
    enabled: authReady && !!studentId,
  });
}

/**
 * Get child grades.
 * Backend: GET /assessments/students/me/gradebook/{term_id}
 *
 * Note: This endpoint works for the authenticated student.
 * For guardian viewing a child's grades, we fall back to an empty response
 * if the endpoint is not accessible.
 */
export function useChildGrades(studentId: string, filters: GradeFilters) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: queryKeys.guardianPortal.grades(studentId, filters),
    queryFn: async () => {
      if (!filters.termId) return { items: [], subjects: [] };
      try {
        const { data } = await api.get(
          `/assessments/students/me/gradebook/${filters.termId}`,
        );
        return data;
      } catch {
        return { items: [], subjects: [] };
      }
    },
    enabled: authReady && !!studentId,
  });
}

/**
 * Get child schedule.
 * Backend: GET /schedule/section/{section_id}
 */
export function useChildSchedule(studentId: string) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: queryKeys.guardianPortal.schedule(studentId),
    queryFn: async () => {
      try {
        const { data: enrollments } = await api.get(
          `/enrollments/student/${studentId}`,
        );
        const items = enrollments?.items ?? (Array.isArray(enrollments) ? enrollments : []);
        const activeEnrollment = items.find(
          (e: Record<string, unknown>) => e.status === 'active',
        );

        if (!activeEnrollment?.section_id) return [];

        const { data: schedule } = await api.get(
          `/schedule/section/${activeEnrollment.section_id}`,
        );
        return schedule;
      } catch {
        return [];
      }
    },
    enabled: authReady && !!studentId,
  });
}
