'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { StudentRisk, analyticsKeys } from "../types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useAtRiskStudents(filters?: {
  riskLevel?: string;
  classId?: string;
  sectionId?: string;
  termId?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.atRisk(filters),
    queryFn: async (): Promise<{ students: StudentRisk[]; total: number }> => {
      const { data } = await axiosInstance.get<{ students: any[]; total: number }>('/analytics/at-risk-students', {
        params: filters,
      });
      
      // The backend returns raw student data, we map it to StudentRisk on the frontend 
      // if the backend doesn't already provide the calculated risk object.
      // Assuming backend returns correctly formatted StudentRisk for now.
      return {
        students: data.students as StudentRisk[],
        total: data.total
      };
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
    mutationFn: async ({ studentId, note }: { studentId: string; note: string }) => {
      const { data } = await axiosInstance.post(`/students/${studentId}/intervention-notes`, {
        note,
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
