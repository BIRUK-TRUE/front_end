import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { ChildDetails } from '../types';
import type { AttendanceRecord, PaginatedResponse } from '../../student-portal/types';

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

/**
 * Get child/student details.
 * Backend: GET /students/{id}
 */
export function useChildDetails(studentId: string) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: queryKeys.guardianPortal.childDetails(studentId),
    queryFn: async (): Promise<ChildDetails> => {
      const { data } = await api.get(`/students/${studentId}`);
      return data;
    },
    enabled: authReady && !!studentId,
  });
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
        }
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
        // Guardian may not have direct access to this endpoint
        return { items: [], subjects: [] };
      }
    },
    enabled: authReady && !!studentId,
  });
}

/**
 * Get child schedule.
 * Backend: GET /schedule/section/{section_id}
 *
 * Since we need the section_id (not student_id), this requires
 * first fetching the student's enrollment to determine their section.
 */
export function useChildSchedule(studentId: string) {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: queryKeys.guardianPortal.schedule(studentId),
    queryFn: async () => {
      try {
        // Get student's current enrollment to find section
        const { data: enrollments } = await api.get(
          `/enrollments/student/${studentId}`,
        );
        const items = enrollments?.items ?? (Array.isArray(enrollments) ? enrollments : []);
        const activeEnrollment = items.find(
          (e: Record<string, unknown>) => e.status === 'active'
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
