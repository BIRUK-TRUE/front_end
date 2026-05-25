"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import { AssessmentType, type Assessment, type Grade, type BulkGradePayload, type ReportCard } from "../types";

const gradesKeys = {
  all: ["grades"] as const,
  assessments: (filters?: Record<string, unknown>) =>
    [...gradesKeys.all, "assessments", filters] as const,
  gradesByAssessment: (assessmentId: string) =>
    [...gradesKeys.all, "by-assessment", assessmentId] as const,
  studentGrades: (studentId: string, yearId: string) =>
    [...gradesKeys.all, "student", studentId, yearId] as const,
  reportCard: (studentId: string, termId: string) =>
    [...gradesKeys.all, "report-card", studentId, termId] as const,
};

/**
 * List assessments with optional filters.
 * Backend: GET /assessments
 *
 * Backend supports: teacher_subject_id, term_id, status (query params)
 * We also accept classId/subjectId for convenience and pass through
 * any backend-compatible params.
 */
export function useAssessments(
  classId: string,
  subjectId: string,
  extraFilters?: { teacher_subject_id?: string; term_id?: string; status?: string },
) {
  return useQuery({
    queryKey: gradesKeys.assessments({ classId, subjectId, ...extraFilters }),
    queryFn: async (): Promise<Assessment[]> => {
      const params: Record<string, string> = {};
      if (extraFilters?.teacher_subject_id) {
        params.teacher_subject_id = extraFilters.teacher_subject_id;
      }
      if (extraFilters?.term_id) {
        params.term_id = extraFilters.term_id;
      }
      if (extraFilters?.status) {
        params.status = extraFilters.status;
      }

      const { data } = await axiosInstance.get("/assessments", { params });
      // Backend returns PaginatedAssessmentsResponse: { items, total, page, size, pages }
      const items = data?.items ?? (Array.isArray(data) ? data : []);
      const toAssessmentType = (value: unknown): AssessmentType => {
        const normalized = String(value ?? "final").toLowerCase();
        return Object.values(AssessmentType).includes(normalized as AssessmentType)
          ? (normalized as AssessmentType)
          : AssessmentType.FINAL;
      };

      return items.map(
        (a: Record<string, unknown>): Assessment => ({
          id: a.id as string,
          name: (a.title ?? a.name ?? "") as string,
          type: toAssessmentType(a.assessment_type ?? a.type),
          max_score: (a.max_score ?? 100) as number,
          weight: (a.weight ?? 0) as number,
          date: (a.assessment_date ?? a.date ?? "") as string,
          subject_id: (a.subject_id ?? "") as string,
          term_id: (a.term_id ?? "") as string,
          class_id: (a.class_id ?? "") as string,
          subject_name: (a.subject_name ?? "") as string,
          class_name: (a.class_name ?? "") as string,
          term_name: (a.term_name ?? "") as string,
          created_at: (a.created_at ?? "") as string,
        }),
      );
    },
    enabled: !!(classId || subjectId || extraFilters?.teacher_subject_id),
  });
}

/**
 * Create a new assessment.
 * Backend: POST /assessments
 */
export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<
        Assessment,
        | "id"
        | "created_at"
        | "subject_name"
        | "class_name"
        | "section_name"
        | "term_name"
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

/**
 * Get grades/scores for a specific assessment.
 * Backend: GET /assessments/{id}/grades
 *
 * Returns AssessmentDetailResponse: { assessment, scores }
 */
export function useGradesByAssessment(assessmentId: string) {
  return useQuery({
    queryKey: gradesKeys.gradesByAssessment(assessmentId),
    queryFn: async (): Promise<Grade[]> => {
      const { data } = await axiosInstance.get(
        `/assessments/${assessmentId}/grades`,
      );
      // Backend returns { assessment: {...}, scores: [...] }
      const scores = data?.scores ?? (Array.isArray(data) ? data : []);
      return scores.map(
        (s: Record<string, unknown>): Grade => ({
          id: s.id as string,
          student_id: (s.student_id ?? "") as string,
          student_name: (s.student_name ?? "") as string,
          registration_number: (s.registration_number ?? "") as string,
          assessment_id: (s.assessment_id ?? assessmentId) as string,
          score: (s.score ?? null) as number | null,
          comment: (s.remark ?? s.comment ?? "") as string,
        }),
      );
    },
    enabled: !!assessmentId,
  });
}

/**
 * Submit grades in bulk.
 * Backend: POST /assessments/{id}/grades/bulk
 *
 * Accepts frontend format: { entries: [{ student_id, score, comment }] }
 */
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

/**
 * Get student term gradebook.
 * Backend: GET /assessments/students/me/gradebook/{term_id}
 *
 * Note: Only available for students viewing their own grades.
 */
export function useReportCard(studentId: string, termId: string) {
  return useQuery({
    queryKey: gradesKeys.reportCard(studentId, termId),
    queryFn: async (): Promise<ReportCard> => {
      const { data } = await axiosInstance.get(
        `/assessments/students/me/gradebook/${termId}`,
      );
      return data;
    },
    enabled: !!studentId && !!termId,
  });
}

/**
 * Delete an assessment.
 * Backend: DELETE /assessments/{id}
 */
export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assessmentId: string) => {
      await axiosInstance.delete(`/assessments/${assessmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.all });
      toast.success("Assessment deleted");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to delete assessment"));
    },
  });
}

/**
 * Update an assessment.
 * Backend: PATCH /assessments/{id}
 */
export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Assessment>;
    }) => {
      const { data } = await axiosInstance.patch(`/assessments/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.all });
      toast.success("Assessment updated");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update assessment"));
    },
  });
}
