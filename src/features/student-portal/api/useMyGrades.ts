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
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.grades(studentId, { type: 'summary', termId }),
    queryFn: async () => {
      const { data } = await api.get<GradesSummaryResponse>(
        `/students/${studentId}/grades/summary`,
        { params: termId ? { term_id: termId } : {} }
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
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.grades(studentId, { type: 'assessments', ...filters }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AssessmentGradeRecord>>(
        `/students/${studentId}/grades/assessments`,
        {
          params: {
            term_id: filters.termId,
            subject_id: filters.subjectId,
            page: filters.page,
            size: filters.size,
          },
        }
      );
      return data;
    },
    enabled: isHydrated && !!studentId,
  });
}

export function useMyReportCard(termId: string) {
  const { user, isHydrated } = useAuthStore();
  const studentId = user?.student_id || user?.id || '';

  return useQuery({
    queryKey: queryKeys.studentPortal.reportCard(studentId, termId),
    queryFn: async () => {
      // Use the gradebook endpoint and transform to ReportCardData shape
      const { data } = await api.get<GradesSummaryResponse>(
        `/students/${studentId}/grades/summary`,
        { params: { term_id: termId } }
      );
      const reportCard: ReportCardData = {
        student: {
          fullName: user?.full_name || '',
          studentIdNumber: '',
          className: '',
          sectionName: '',
        },
        term: { name: '', academicYear: '' },
        schoolInfo: { name: 'School Management System', logoUrl: null },
        subjects: (data?.subjects || []).map((s) => ({
          subjectName: s.subjectName,
          scoreEarned: s.totalScoreEarned,
          totalMarks: s.totalPossibleMarks,
          percentage: s.percentage,
          passed: s.passed,
          teacherRemarks: null,
        })),
        summary: {
          totalScoreEarned: (data?.subjects || []).reduce((acc, s) => acc + s.totalScoreEarned, 0),
          totalPossibleMarks: (data?.subjects || []).reduce((acc, s) => acc + s.totalPossibleMarks, 0),
          overallPercentage: data?.subjects?.length
            ? Math.round(
                (data.subjects.reduce((acc, s) => acc + s.percentage, 0) / data.subjects.length) * 10
              ) / 10
            : 0,
          classRank: null,
          totalStudentsInClass: null,
        },
        generalRemarks: null,
      };
      return reportCard;
    },
    enabled: isHydrated && !!studentId && !!termId,
  });
}
