import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { StudentDashboardData } from '../types';

/**
 * Student dashboard hook.
 *
 * The backend doesn't have a dedicated /students/{id}/dashboard endpoint.
 * We construct dashboard data from the student profile and attendance stats.
 */
export function useStudentDashboard() {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.dashboard(studentId),
    queryFn: async (): Promise<StudentDashboardData> => {
      // Fetch student profile
      const { data: student } = await api.get(`/students/${studentId}`);

      // Fetch attendance stats
      let attendanceStats = { total_days: 0, present_days: 0, absent_days: 0, attendance_rate: 0 };
      try {
        const { data } = await api.get(`/attendance/student/${studentId}/stats`);
        attendanceStats = data;
      } catch {
        // Attendance stats may not be available yet
      }

      return {
        student_name: `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim(),
        class_name: student?.current_class ?? '',
        section_name: student?.section_name ?? '',
        registration_number: student?.registration_number ?? '',
        attendance_rate: attendanceStats.attendance_rate ?? 0,
        total_days: attendanceStats.total_days ?? 0,
        present_days: attendanceStats.present_days ?? 0,
        absent_days: attendanceStats.absent_days ?? 0,
        upcoming_assessments: [],
        recent_grades: [],
      };
    },
    enabled: isHydrated && !!studentId,
  });
}
