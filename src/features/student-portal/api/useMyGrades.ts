import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuthStore } from '@/lib/store/auth-store';
import type {
  GradesSummaryResponse,
  PaginatedResponse,
  AssessmentGradeRecord,
  ReportCardData,
} from '../types';

export function useMySubjectSummary(termId?: string) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.grades(studentId, { type: 'summary', termId }),
    queryFn: async () => {
      const { data } = await api.get<GradesSummaryResponse>(
        `/api/students/${studentId}/grades/summary`,
        { params: { termId } }
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useMyAssessmentGrades(filters: {
  termId?: string;
  subjectId?: string;
  page: number;
  size: number;
}) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.grades(studentId, { type: 'assessments', ...filters }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AssessmentGradeRecord>>(
        `/api/students/${studentId}/grades/assessments`,
        { params: filters }
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useMyReportCard(termId: string) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.reportCard(studentId, termId),
    queryFn: async () => {
      const { data } = await api.get<ReportCardData>(
        `/api/students/${studentId}/grades/report-card`,
        { params: { termId } }
      );
      return data;
    },
    enabled: isHydrated && !!studentId && !!termId,
  });
}
