import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { StudentDashboardData } from '../types';

export function useStudentDashboard() {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.dashboard(studentId),
    queryFn: async (): Promise<StudentDashboardData> => {
      const { data } = await api.get(`/students/${studentId}/dashboard`);
      return data;
    },
    enabled: authReady && !!studentId,
  });
}
