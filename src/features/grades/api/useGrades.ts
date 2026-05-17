"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { Assessment, Grade, BulkGradePayload, ReportCard } from "../types";

const gradesKeys = {
  all: ["grades"] as const,
  assessments: (classId: string, subjectId: string) =>
    [...gradesKeys.all, "assessments", classId, subjectId] as const,
  gradesByAssessment: (assessmentId: string) =>
    [...gradesKeys.all, "by-assessment", assessmentId] as const,
  studentGrades: (studentId: string, yearId: string) =>
    [...gradesKeys.all, "student", studentId, yearId] as const,
  reportCard: (studentId: string, termId: string) =>
    [...gradesKeys.all, "report-card", studentId, termId] as const,
};

export function useAssessments(classId: string, subjectId: string) {
  return useQuery({
    queryKey: gradesKeys.assessments(classId, subjectId),
    queryFn: async (): Promise<Assessment[]> => {
      const { data } = await axiosInstance.get("/assessments", {
        params: { class_id: classId, subject_id: subjectId },
      });
      return data;
    },
    enabled: !!classId && !!subjectId,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<
        Assessment,
        "id" | "created_at" | "subject_name" | "class_name" | "term_name"
      >,
    ) => {
      const { data } = await axiosInstance.post("/assessments", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.all });
      toast.success("Assessment created successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create assessment"));
    },
  });
}

export function useGradesByAssessment(assessmentId: string) {
  return useQuery({
    queryKey: gradesKeys.gradesByAssessment(assessmentId),
    queryFn: async (): Promise<Grade[]> => {
      const { data } = await axiosInstance.get(
        `/assessments/${assessmentId}/grades`,
      );
      return data;
    },
    enabled: !!assessmentId,
  });
}

export function useSubmitGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkGradePayload) => {
      const { data } = await axiosInstance.post(
        `/assessments/${payload.assessment_id}/grades/bulk`,
        payload,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gradesKeys.gradesByAssessment(variables.assessment_id),
      });
      toast.success("Grades submitted successfully");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to submit grades"));
    },
  });
}

export function useReportCard(studentId: string, termId: string) {
  return useQuery({
    queryKey: gradesKeys.reportCard(studentId, termId),
    queryFn: async (): Promise<ReportCard> => {
      const { data } = await axiosInstance.get(
        `/assessments/grades/report-card/${studentId}`,
        {
          params: { termId },
        },
      );
      return data;
    },
    enabled: !!studentId && !!termId,
  });
}
