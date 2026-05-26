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
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.grades(studentId, { type: 'summary', termId }),
    queryFn: async (): Promise<GradesSummaryResponse> => {
      const { data } = await api.get(`/students/${studentId}/grades/summary`, {
        params: termId ? { term_id: termId } : undefined,
      });
      return { subjects: data?.subjects ?? [] };
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
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.grades(studentId, { type: 'assessments', ...filters }),
    queryFn: async (): Promise<PaginatedResponse<AssessmentGradeRecord>> => {
      const { data } = await api.get(`/students/${studentId}/grades/assessments`, {
        params: {
          term_id: filters.termId,
          subject_id: filters.subjectId,
          page: filters.page,
          size: filters.size,
        },
      });
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useMyReportCard(termId: string) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id ?? '';

  return useQuery({
    queryKey: queryKeys.studentPortal.reportCard(studentId, termId),
    queryFn: async (): Promise<ReportCardData> => {
      const { data } = await api.get(`/students/${studentId}/grades/summary`, {
        params: { term_id: termId },
      });
      const subjects = data?.subjects ?? [];
      return {
        student: {
          fullName: user?.full_name || '',
          studentIdNumber: '',
          className: '',
          sectionName: '',
        },
        term: { name: '', academicYear: '' },
        schoolInfo: { name: 'School Management System', logoUrl: null },
        subjects: subjects.map((s: Record<string, unknown>) => ({
          subjectName: (s.subjectName ?? '') as string,
          scoreEarned: (s.totalScoreEarned ?? 0) as number,
          totalMarks: (s.totalPossibleMarks ?? 100) as number,
          percentage: (s.percentage ?? 0) as number,
          passed: (s.passed ?? false) as boolean,
          teacherRemarks: null,
        })),
        summary: {
          totalScoreEarned: 0,
          totalPossibleMarks: 0,
          overallPercentage: subjects.length
            ? Math.round(
                subjects.reduce(
                  (acc: number, s: Record<string, unknown>) =>
                    acc + ((s.percentage as number) ?? 0),
                  0,
                ) / subjects.length,
              )
            : 0,
          classRank: null,
          totalStudentsInClass: null,
        },
        generalRemarks: null,
      };
    },
    enabled: isHydrated && !!studentId && !!termId,
  });
}
