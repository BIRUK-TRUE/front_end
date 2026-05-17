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
      const { data } = await axiosInstance.get(
        `/teachers/${teacherId}/assessments`,
        { params: filters },
      );
      // The backend returns { teacher_id, assessments: [...] }
      // The hook expects { items, total }
      return {
        items: (data.assessments || []).map((a: any) => ({
          id: a.id,
          sectionId: a.section_id,
          className: a.class_name,
          sectionName: a.section_name,
          subjectName: a.subject_name,
          termName: a.term_name,
          assessmentName: a.assessment_name,
          type: a.type,
          date: a.date,
          totalMarks: a.total_marks,
          gradesEntered: a.grades_entered,
        })),
        total: data.assessments?.length || 0,
      };
    },
    enabled: !!teacherId,
  });
}

export function useAssessmentGrades(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.assessmentGrades(assessmentId),
    queryFn: async (): Promise<TeacherAssessmentGrade[]> => {
      const { data } = await axiosInstance.get<Grade[]>(
        `/assessments/${assessmentId}/grades`,
      );
      return data.map((grade) => ({
        studentId: grade.student_id,
        studentName: grade.student_name,
        studentCode: grade.registration_number,
        score: grade.score,
        remarks: grade.comment,
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
