import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { GuardianDashboardData, ChildSummary } from '../types';

/**
 * Guardian dashboard hook.
 *
 * The backend doesn't have a dedicated /guardians/{id}/dashboard endpoint.
 * We construct dashboard data from the guardian's linked students info
 * available via GET /guardians/{id} which includes student details.
 */
export function useGuardianDashboard() {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const guardianId = user?.guardian_id ?? '';

  return useQuery({
    queryKey: queryKeys.guardianPortal.dashboard(guardianId),
    queryFn: async (): Promise<GuardianDashboardData> => {
      // Fetch guardian profile with linked students
      const { data: guardian } = await api.get(`/guardians/${guardianId}`);

      const students = guardian?.students ?? guardian?.linked_students ?? [];

      const children: ChildSummary[] = students.map((s: Record<string, unknown>) => ({
        id: (s.id ?? s.student_id ?? '') as string,
        fullName: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim(),
        studentId: (s.registration_number ?? '') as string,
        photoUrl: (s.photo_url ?? null) as string | null,
        className: (s.class_name ?? s.current_class ?? '') as string,
        sectionName: (s.section_name ?? '') as string,
        attendanceRate: 0,
        gradeAverage: 0,
        feeStatus: 'unpaid' as const,
      }));

      return {
        children,
        recentAlerts: [],
      };
    },
    enabled: authReady && !!guardianId,
  });
}
