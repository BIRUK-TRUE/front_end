import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { ChildSummary } from '../types';

interface StudentLink {
  student_id: string;
  student_name: string;
  student_registration_number: string;
  relationship_type: string;
  is_primary: boolean;
  is_emergency_contact: boolean;
  can_pickup: boolean;
}

interface GuardianResponse {
  id: string;
  student_links: StudentLink[];
}

export function useMyChildren() {
  const { user } = useAuthStore();
  const authReady = useAuthReady();
  const guardianId = user?.guardian_id ?? '';

  return useQuery({
    queryKey: queryKeys.guardianPortal.children(guardianId),
    queryFn: async (): Promise<ChildSummary[]> => {
      const { data } = await api.get<GuardianResponse>(`/guardians/${guardianId}`);
      return (data.student_links ?? []).map((link) => ({
        id: link.student_id,
        fullName: link.student_name,
        studentId: link.student_registration_number,
        photoUrl: null,
        className: '',
        sectionName: '',
        attendanceRate: 0,
        gradeAverage: 0,
        feeStatus: 'unpaid' as const,
      }));
    },
    enabled: authReady && !!guardianId,
  });
}
