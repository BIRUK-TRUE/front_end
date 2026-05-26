import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { StudentDashboardData } from '../types';

export function useStudentDashboard() {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.dashboard(studentId),
    queryFn: async (): Promise<StudentDashboardData> => {
      const { data } = await api.get(`/students/${studentId}/dashboard`);
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}
