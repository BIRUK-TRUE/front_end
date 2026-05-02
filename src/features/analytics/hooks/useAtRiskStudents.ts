'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { StudentRisk, analyticsKeys, Intervention } from "../types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
      const { data } = await axiosInstance.get<{ students: StudentRisk[]; total: number }>('/analytics/at-risk-students', {
        params: filters,
      });
      
      return data;
    },
    enabled: true,
  });
}

export function useNotifyGuardian() {
  const t = useTranslations("analytics.notifyGuardian");
  
  return useMutation({
    mutationFn: async ({ studentId, message }: { studentId: string; message: string }) => {
      const { data } = await axiosInstance.post('/notifications/send-to-guardian', {
        studentId,
        message,
        type: 'intervention'
      });
      return data;
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
      const { data } = await axiosInstance.post(`/analytics/interventions`, {
        student_id: studentId,
        note,
        type: type || 'counseling',
        date: new Date().toISOString()
      });
      return data;
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
      const { data } = await axiosInstance.get(`/analytics/interventions`, {
        params: { student_id: studentId }
      });
      return data;
    },
    enabled: !!studentId,
  });
}

export function useUpdateIntervention() {
  const t = useTranslations("analytics.interventionNote");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note, type }: { id: string; note: string; type?: string }) => {
      const { data } = await axiosInstance.patch(`/analytics/interventions/${id}`, {
        note,
        type,
      });
      return data;
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
      await axiosInstance.delete(`/analytics/interventions/${id}`);
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
