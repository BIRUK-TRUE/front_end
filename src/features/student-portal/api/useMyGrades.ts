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

/**
 * Get student's grades summary (subject-level view).
 * Backend: GET /assessments/students/me/gradebook/{term_id}
 */
export function useMySubjectSummary(termId?: string) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.grades(studentId, { type: 'summary', termId }),
    queryFn: async (): Promise<GradesSummaryResponse> => {
      if (!termId) {
        return { subjects: [], overallAverage: 0 };
      }
      try {
        const { data } = await api.get(
          `/assessments/students/me/gradebook/${termId}`
        );
        return data;
      } catch {
        return { subjects: [], overallAverage: 0 };
      }
    },
    enabled: isHydrated && !!studentId,
  });
}

/**
 * Get student's individual assessment grades.
 * Backend: GET /assessments/students/me/gradebook/{term_id}
 *
 * The backend returns all grades for a term. We can filter client-side
 * by subject if needed.
 */
export function useMyAssessmentGrades(filters: {
  termId?: string;
  subjectId?: string;
  page: number;
  size: number;
}) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.grades(studentId, { type: 'assessments', ...filters }),
    queryFn: async (): Promise<PaginatedResponse<AssessmentGradeRecord>> => {
      if (!filters.termId) {
        return { items: [], total: 0, page: 1, size: filters.size, pages: 0 };
      }
      try {
        const { data } = await api.get(
          `/assessments/students/me/gradebook/${filters.termId}`
        );
        // Transform gradebook response into assessment records
        const allGrades = data?.grades ?? data?.items ?? [];
        const filtered = filters.subjectId
          ? allGrades.filter((g: Record<string, unknown>) => g.subject_id === filters.subjectId)
          : allGrades;

        return {
          items: filtered,
          total: filtered.length,
          page: filters.page,
          size: filters.size,
          pages: Math.ceil(filtered.length / filters.size),
        };
      } catch {
        return { items: [], total: 0, page: 1, size: filters.size, pages: 0 };
      }
    },
    enabled: isHydrated && !!studentId,
  });
}

/**
 * Get student's report card for a term.
 * Backend: GET /assessments/students/me/gradebook/{term_id}
 */
export function useMyReportCard(termId: string) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.reportCard(studentId, termId),
    queryFn: async (): Promise<ReportCardData> => {
      try {
        const { data } = await api.get(
          `/assessments/students/me/gradebook/${termId}`
        );
        const subjects = data?.subjects ?? [];
        const reportCard: ReportCardData = {
          student: {
            fullName: user?.full_name || '',
            studentIdNumber: '',
            className: '',
            sectionName: '',
          },
          term: { name: '', academicYear: '' },
          schoolInfo: { name: 'School Management System', logoUrl: null },
          subjects: subjects.map((s: Record<string, unknown>) => ({
            subjectName: (s.subjectName ?? s.subject_name ?? '') as string,
            scoreEarned: (s.totalScoreEarned ?? s.score ?? 0) as number,
            totalMarks: (s.totalPossibleMarks ?? s.max_score ?? 100) as number,
            percentage: (s.percentage ?? 0) as number,
            passed: (s.passed ?? ((s.percentage as number) >= 50)) as boolean,
            teacherRemarks: null,
          })),
          summary: {
            totalScoreEarned: subjects.reduce(
              (acc: number, s: Record<string, unknown>) =>
                acc + ((s.totalScoreEarned ?? s.score ?? 0) as number),
              0
            ),
            totalPossibleMarks: subjects.reduce(
              (acc: number, s: Record<string, unknown>) =>
                acc + ((s.totalPossibleMarks ?? s.max_score ?? 100) as number),
              0
            ),
            overallPercentage: subjects.length
              ? Math.round(
                  (subjects.reduce(
                    (acc: number, s: Record<string, unknown>) =>
                      acc + ((s.percentage ?? 0) as number),
                    0
                  ) /
                    subjects.length) *
                    10
                ) / 10
              : 0,
            classRank: null,
            totalStudentsInClass: null,
          },
          generalRemarks: null,
        };
        return reportCard;
      } catch {
        return {
          student: { fullName: '', studentIdNumber: '', className: '', sectionName: '' },
          term: { name: '', academicYear: '' },
          schoolInfo: { name: 'School Management System', logoUrl: null },
          subjects: [],
          summary: {
            totalScoreEarned: 0,
            totalPossibleMarks: 0,
            overallPercentage: 0,
            classRank: null,
            totalStudentsInClass: null,
          },
          generalRemarks: null,
        };
      }
    },
    enabled: isHydrated && !!studentId && !!termId,
  });
}
