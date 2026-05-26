"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type {
  ScheduleEntry,
  SchedulePeriod,
  CreateSchedulePeriodPayload,
  UpdateSchedulePeriodPayload,
  TimetableGenerationResult,
} from "../types";

export const scheduleKeys = {
  all: ["schedule"] as const,
  bySection: (sectionId: string, termId: string) =>
    [...scheduleKeys.all, "section", sectionId, termId] as const,
  byTeacher: (teacherId: string, termId: string) =>
    [...scheduleKeys.all, "teacher", teacherId, termId] as const,
  byClassroom: (classroomId: string, termId: string) =>
    [...scheduleKeys.all, "classroom", classroomId, termId] as const,
  byTerm: (termId: string) => [...scheduleKeys.all, "term", termId] as const,
  period: (periodId: string) =>
    [...scheduleKeys.all, "period", periodId] as const,
};

/** Assignment-based schedule for a section */
export function useSectionSchedule(sectionId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.bySection(sectionId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/section/${sectionId}`,
        { params: { term_id: termId } },
      );
      return data;
    },
    enabled: !!sectionId && !!termId,
  });
}

export function useTeacherSchedule(teacherId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.byTeacher(teacherId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/teacher/${teacherId}`,
        { params: { term_id: termId } },
      );
      return data;
    },
    enabled: !!teacherId && !!termId,
  });
}

/** Timetable periods for a section */
export function useSectionTimetable(sectionId: string, termId: string) {
  return useQuery({
    queryKey: [...scheduleKeys.bySection(sectionId, termId), "timetable"] as const,
    queryFn: async (): Promise<SchedulePeriod[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/section/${sectionId}/timetable`,
        { params: { term_id: termId } },
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!sectionId && !!termId,
  });
}

export function useTeacherTimetable(teacherId: string, termId: string) {
  return useQuery({
    queryKey: [...scheduleKeys.byTeacher(teacherId, termId), "timetable"] as const,
    queryFn: async (): Promise<SchedulePeriod[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/teacher/${teacherId}/timetable`,
        { params: { term_id: termId } },
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!teacherId && !!termId,
  });
}

export function useClassroomTimetable(classroomId: string, termId: string) {
  return useQuery({
    queryKey: [...scheduleKeys.byClassroom(classroomId, termId), "timetable"] as const,
    queryFn: async (): Promise<SchedulePeriod[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/classroom/${classroomId}/timetable`,
        { params: { term_id: termId } },
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!classroomId && !!termId,
  });
}

export function useCreateSchedulePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSchedulePeriodPayload) => {
      const { data } = await axiosInstance.post("/schedule/periods", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success("Schedule period created");
    },
    onError: (error) => toast.error(formatApiError(error)),
  });
}

export function useUpdateSchedulePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSchedulePeriodPayload;
    }) => {
      const { data: result } = await axiosInstance.patch(
        `/schedule/periods/${id}`,
        data,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success("Schedule period updated");
    },
    onError: (error) => toast.error(formatApiError(error)),
  });
}

export function useDeleteSchedulePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (periodId: string) => {
      await axiosInstance.delete(`/schedule/periods/${periodId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success("Schedule period deleted");
    },
    onError: (error) => toast.error(formatApiError(error)),
  });
}

export function useValidateSchedulePeriod() {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await axiosInstance.post("/schedule/validate", payload);
      return data as { valid: boolean; conflicts: string[] };
    },
  });
}

export function useGenerateTimetable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      term_id: string;
      section_ids?: string[];
      strategy?: string;
    }): Promise<TimetableGenerationResult> => {
      const { data } = await axiosInstance.post("/schedule/generate", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
    onError: (error) => toast.error(formatApiError(error)),
  });
}

// Legacy aliases used by older schedule pages
export function useCreateScheduleEntry() {
  return useCreateSchedulePeriod();
}

export function useUpdateScheduleEntry() {
  return useUpdateSchedulePeriod();
}

export function useDeleteScheduleEntry() {
  return useDeleteSchedulePeriod();
}
