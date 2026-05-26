'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
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
  return useAuthenticatedQuery({
    queryKey: analyticsKeys.atRisk(filters),
    queryFn: async (): Promise<{ students: StudentRisk[]; total: number }> => {
      const { data } = await axiosInstance.get('/analytics/at-risk-students', {
        params: {
          risk_level: filters?.riskLevel,
          class_id: filters?.classId,
          section_id: filters?.sectionId,
          term_id: filters?.termId,
        },
      });
      const raw = data?.students ?? data?.items ?? [];
      const mapped = (Array.isArray(raw) ? raw : []).map(
        (s: Record<string, unknown>): StudentRisk => ({
          studentId: String(s.student_id ?? s.studentId ?? ''),
          studentName: String(s.student_name ?? s.studentName ?? ''),
          registrationNumber: String(s.registration_number ?? s.registrationNumber ?? ''),
          className: String(s.class_name ?? s.className ?? ''),
          sectionName: String(s.section_name ?? s.sectionName ?? ''),
          level: (s.risk_level ?? s.level ?? 'low') as StudentRisk['level'],
          factors: (s.factors as StudentRisk['factors']) ?? [],
          score: Number(s.risk_score ?? s.score ?? 0),
          attendanceRate: Number(s.attendance_rate ?? s.attendanceRate ?? 0),
          gradeAverage: Number(s.grade_average ?? s.gradeAverage ?? 0),
          lastAbsenceDate: s.last_absence_date as string | undefined,
          consecutiveAbsences: Number(s.consecutive_absences ?? s.consecutiveAbsences ?? 0),
          guardianInfo: s.guardian_info as StudentRisk['guardianInfo'],
        }),
      );
      // Deduplicate by studentId — keep the entry with the most risk factors
      const seen = new Map<string, StudentRisk>();
      for (const s of mapped) {
        const existing = seen.get(s.studentId);
        if (!existing || s.factors.length > existing.factors.length) {
          seen.set(s.studentId, s);
        }
      }
      const students = Array.from(seen.values());
      return { students, total: data?.total ?? students.length };
    },
  });
}

export function useNotifyGuardian() {
  const t = useTranslations("analytics.notifyGuardian");

  return useMutation({
    mutationFn: async ({ studentId, message }: { studentId: string; message: string }) => {
      const { data } = await axiosInstance.post('/notifications/send-to-guardian', {
        student_id: studentId,
        message,
      });
      return data;
    },
    onSuccess: () => {
      toast.success(t("sendSuccess"));
    },
    onError: () => {
      toast.error(t("sendFailed"));
    },
  });
}

export function useAddInterventionNote() {
  const t = useTranslations("analytics.interventionNote");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      note,
      type,
    }: {
      studentId: string;
      note: string;
      type?: string;
    }) => {
      const { data } = await axiosInstance.post('/analytics/interventions', {
        student_id: studentId,
        note,
        type: type ?? 'other',
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.atRisk() });
      toast.success(t("saveSuccess"));
    },
    onError: () => {
      toast.error(t("saveFailed"));
    },
  });
}

export function useStudentInterventions(studentId: string) {
  return useAuthenticatedQuery({
    queryKey: analyticsKeys.interventions(studentId),
    queryFn: async (): Promise<Intervention[]> => {
      const { data } = await axiosInstance.get('/analytics/interventions', {
        params: { student_id: studentId },
      });
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map((item: Record<string, unknown>) => ({
        id: String(item.id ?? ''),
        studentId: String(item.student_id ?? studentId),
        type: (item.type ?? 'other') as Intervention['type'],
        note: String(item.note ?? ''),
        createdAt: String(item.created_at ?? ''),
        createdBy: String(item.created_by ?? ''),
      }));
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success(t("updateSuccess"));
    },
    onError: () => {
      toast.error(t("updateFailed"));
    },
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
    },
  });
}
