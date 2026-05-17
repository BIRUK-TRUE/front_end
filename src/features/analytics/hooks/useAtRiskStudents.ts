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
      const { data: response } = await axiosInstance.get<{
        data: Array<{
          student_id: string;
          student_name: string;
          registration_number: string;
          class_name: string;
          section_name: string;
          risk_factors: string[];
          attendance_percentage: number;
          average_grade: number;
          payment_balance: number;
        }>;
        total_count: number;
      }>('/analytics/at-risk-students', {
        params: filters,
      });
      
      return {
        students: response.data.map(item => {
          const factors: any[] = [];
          (item.risk_factors || []).forEach(f => {
            if (f === 'low_attendance') {
              factors.push({
                type: 'attendance',
                value: item.attendance_percentage,
                threshold: 75,
                message: 'analytics.riskFactors.attendance',
              });
            } else if (f === 'poor_grades') {
              factors.push({
                type: 'grade',
                value: item.average_grade,
                threshold: 60,
                message: 'analytics.riskFactors.grade',
              });
            } else if (f === 'outstanding_fees') {
              factors.push({
                type: 'financial',
                value: item.payment_balance,
                threshold: 0,
                message: 'analytics.riskFactors.financial',
              });
            }
          });

          const factorCount = factors.length;
          const level: 'critical' | 'high' | 'medium' | 'low' = 
            factorCount >= 3 ? 'critical' : 
            factorCount === 2 ? 'high' : 
            factorCount === 1 ? 'medium' : 'low';

          return {
            studentId: item.student_id,
            studentName: item.student_name,
            registrationNumber: item.registration_number,
            className: item.class_name,
            sectionName: item.section_name,
            level,
            factors,
            score: factorCount * 30,
            attendanceRate: item.attendance_percentage,
            gradeAverage: item.average_grade,
            consecutiveAbsences: 0,
          };
        }),
        total: response.total_count,
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
