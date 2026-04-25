"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type {
  TeacherAssessment,
  TeacherAssessmentFilter,
  TeacherAssessmentGrade,
  TeacherGradeSubmitItem,
} from "../types";

export function useTeacherAssessments(
  teacherId: string,
  filters: TeacherAssessmentFilter,
) {
  return useQuery({
    queryKey: queryKeys.teacher.assessments(teacherId, filters),
    queryFn: async (): Promise<{ items: TeacherAssessment[]; total: number }> => {
      // BACKEND REQUIRED: GET /teachers/{teacherId}/assessments
      // Expected query params: { sectionId, subjectName, termName, page, size }
      const { data } = await axiosInstance.get(`/teachers/${teacherId}/assessments`, {
        params: filters,
      });
      return data;
    },
    enabled: !!teacherId,
  });
}

export function useAssessmentGrades(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.assessmentGrades(assessmentId),
    queryFn: async (): Promise<TeacherAssessmentGrade[]> => {
      // BACKEND REQUIRED: GET /assessments/{assessmentId}/grades
      const { data } = await axiosInstance.get(`/assessments/${assessmentId}/grades`);
      return data;
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

      // BACKEND REQUIRED: POST /assessments/{assessmentId}/grades/bulk
      // Expected request body: { grades: [{ studentId, score, remarks }] }
      const { data } = await axiosInstance.post(
        `/assessments/${args.assessmentId}/grades/bulk`,
        { grades: args.grades },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      toast.success(t("gradesSubmitted"));
    },
    onError: (error: { message?: string; response?: { data?: { detail?: string } } }) => {
      if (error.message === "INVALID_SCORE") {
        toast.error(t("scoreRangeError"));
        return;
      }
      toast.error(error.response?.data?.detail || t("submitFailed"));
    },
  });
}
