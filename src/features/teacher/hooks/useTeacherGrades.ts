"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import { useTranslations } from "next-intl";
import type { Assessment, Grade } from "@/features/grades/types";
import type {
  TeacherAssessment,
  TeacherAssessmentFilter,
  TeacherAssessmentGrade,
  TeacherGradeSubmitItem,
} from "../types";

type TeacherScheduleApiEntry = {
  section_id: string;
  section_name: string;
  subject_id: string;
  subject_name: string;
};

type SectionApiResponse = {
  class_id: string;
  name: string;
  full_name: string;
};

function normalizeAssessmentType(type: string): TeacherAssessment["type"] {
  if (type === "quiz") return "quiz";
  if (type === "assignment" || type === "project") return "assignment";
  return "exam";
}

type AssessmentApiItem = {
  id: string;
  teacher_subject_id: string;
  title: string;
  assessment_type: string;
  max_score: number;
  weight: number;
  assessment_date: string;
  status: string;
  term_id: string | null;
  teacher_subject?: {
    section_id: string;
    section_name: string;
    class_name: string;
    subject_name: string;
  };
};

export function useTeacherAssessments(
  teacherId: string,
  filters: TeacherAssessmentFilter,
) {
  return useQuery({
    queryKey: queryKeys.teacher.assessments(teacherId, filters),
    queryFn: async (): Promise<{
      items: TeacherAssessment[];
      total: number;
    }> => {
      const { data } = await axiosInstance.get<{
        items: AssessmentApiItem[];
        total: number;
        page: number;
        size: number;
        pages: number;
      }>(`/teachers/${teacherId}/assessments`, {
        params: {
          page: filters.page ?? 1,
          size: filters.size ?? 20,
          section_id: filters.sectionId,
          term_id: filters.termId,
          status: filters.status,
        },
      });

      const apiItems = Array.isArray(data) ? data : (data?.items ?? []);

      return {
        items: apiItems.map((a: AssessmentApiItem) => ({
          id: a.id,
          sectionId: a.teacher_subject?.section_id ?? '',
          className: a.teacher_subject?.class_name ?? '',
          sectionName: a.teacher_subject?.section_name ?? '',
          subjectName: a.teacher_subject?.subject_name ?? '',
          termName: a.term_id ?? '',
          assessmentName: a.title,
          type: normalizeAssessmentType(a.assessment_type),
          date: a.assessment_date,
          totalMarks: a.max_score,
          gradesEntered: a.status === 'graded',
          status: a.status,
          teacherSubjectId: a.teacher_subject_id,
        })),
        total: Array.isArray(data) ? apiItems.length : (data?.total ?? 0),
      };
    },
    enabled: !!teacherId,
  });
}

type AssessmentGradesApiResponse = {
  assessment: AssessmentApiItem;
  scores: Array<{
    id: string;
    enrollment_id: string;
    student_id: string;
    student_name: string;
    registration_number: string;
    score: number | null;
    is_absent: boolean;
    remark: string | null;
    graded_at: string | null;
  }>;
};

export function useAssessmentGrades(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.assessmentGrades(assessmentId),
    queryFn: async (): Promise<TeacherAssessmentGrade[]> => {
      const { data } = await axiosInstance.get<AssessmentGradesApiResponse>(
        `/assessments/${assessmentId}/grades`,
      );
      const scores = Array.isArray(data) ? data : (data?.scores ?? []);
      return scores.map((grade) => ({
        studentId: grade.student_id,
        studentName: grade.student_name,
        studentCode: grade.registration_number,
        enrollmentId: grade.enrollment_id,
        score: grade.score ?? 0,
        remarks: grade.remark ?? '',
        isAbsent: grade.is_absent,
      }));
    },
    enabled: !!assessmentId,
  });
}

export function useSubmitTeacherGrades() {
  const queryClient = useQueryClient();
  const t = useTranslations("teacher.grades");

  return useMutation({
    mutationFn: async (args: {
      assessmentId: string;
      totalMarks: number;
      grades: TeacherGradeSubmitItem[];
    }) => {
      for (const grade of args.grades) {
        if (grade.score < 0 || grade.score > args.totalMarks) {
          throw new Error("INVALID_SCORE");
        }
      }

      const { data } = await axiosInstance.post(
        `/assessments/${args.assessmentId}/grades/bulk`,
        {
          entries: args.grades.map((grade) => ({
            student_id: grade.studentId,
            enrollment_id: (grade as { enrollmentId?: string }).enrollmentId,
            score: grade.score,
            comment: grade.remarks,
          })),
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      toast.success(t("gradesSubmitted"));
    },
    onError: (error: {
      message?: string;
      response?: { data?: { detail?: string } };
    }) => {
      if (error.message === "INVALID_SCORE") {
        toast.error(t("scoreRangeError"));
        return;
      }
      toast.error(formatApiError(error, t("submitFailed")));
    },
  });
}
