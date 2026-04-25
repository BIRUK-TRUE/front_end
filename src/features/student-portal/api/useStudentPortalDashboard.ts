import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type { StudentDashboardData } from '../types';

export function useStudentDashboard() {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.dashboard(studentId),
    queryFn: async () => {
      const { data } = await api.get<StudentDashboardData>(
        `/api/students/${studentId}/dashboard`
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}
