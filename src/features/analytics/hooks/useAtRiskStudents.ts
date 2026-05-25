'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { StudentRisk, analyticsKeys, Intervention } from "../types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

/**
 * TODO: Analytics module not yet implemented in backend.
 * These hooks return stub data until /analytics/* endpoints are created.
 */

export function useAtRiskStudents(filters?: {
  riskLevel?: string;
  classId?: string;
  sectionId?: string;
  termId?: string;
  teacherId?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.atRisk(filters),
    queryFn: async (): Promise<{ students: StudentRisk[]; total: number }> => {
      // TODO: Backend endpoint /analytics/at-risk-students not yet implemented
      return {
        students: [],
        total: 0,
      };
    },
    enabled: true,
  });
}

export function useNotifyGuardian() {
  const t = useTranslations("analytics.notifyGuardian");
  
  return useMutation({
    mutationFn: async ({ studentId, message }: { studentId: string; message: string }) => {
      // TODO: Backend endpoint /notifications/send-to-guardian not yet implemented
      return { message: "Guardian notification not yet available" };
    },
    onSuccess: () => {
      toast.success(t("sendSuccess"));
    },
    onError: () => {
      toast.error(t("sendFailed"));
    }
  });
}

export function useAddInterventionNote() {
  const t = useTranslations("analytics.interventionNote");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, note, type }: { studentId: string; note: string; type?: string }) => {
      // TODO: Backend endpoint /analytics/interventions not yet implemented
      return { id: "stub", student_id: studentId, note, type };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.atRisk() });
      toast.success(t("saveSuccess"));
    },
    onError: () => {
      toast.error(t("saveFailed"));
    }
  });
}

export function useStudentInterventions(studentId: string) {
  return useQuery({
    queryKey: analyticsKeys.interventions(studentId),
    queryFn: async (): Promise<Intervention[]> => {
      // TODO: Backend endpoint /analytics/interventions not yet implemented
      return [];
    },
    enabled: !!studentId,
  });
}

export function useUpdateIntervention() {
  const t = useTranslations("analytics.interventionNote");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note, type }: { id: string; note: string; type?: string }) => {
      // TODO: Backend endpoint PATCH /analytics/interventions/{id} not yet implemented
      return { id, note, type };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.interventions(variables.id) });
      toast.success(t("updateSuccess"));
    },
    onError: () => {
      toast.error(t("updateFailed"));
    }
  });
}

export function useDeleteIntervention() {
  const t = useTranslations("analytics.interventionNote");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: Backend endpoint DELETE /analytics/interventions/{id} not yet implemented
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.atRisk() });
      toast.success(t("deleteSuccess"));
    },
    onError: () => {
      toast.error(t("deleteFailed"));
    }
  });
}
