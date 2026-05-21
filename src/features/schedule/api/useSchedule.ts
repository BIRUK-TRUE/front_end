"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import type { CreateScheduleEntryPayload, ScheduleEntry } from "../types";

export const scheduleKeys = {
  all: ["schedule"] as const,
  bySection: (sectionId: string, termId: string) =>
    [...scheduleKeys.all, "section", sectionId, termId] as const,
  byTeacher: (teacherId: string, termId: string) =>
    [...scheduleKeys.all, "teacher", teacherId, termId] as const,
};

/**
 * Get schedule for a section (teacher-subject assignments).
 * Backend: GET /schedule/section/{section_id}
 */
export function useSectionSchedule(sectionId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.bySection(sectionId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/section/${sectionId}`,
        {
          params: { term_id: termId },
        },
      );
      return data;
    },
    enabled: !!sectionId && !!termId,
  });
}

/**
 * Get schedule for a teacher (which sections/subjects they teach).
 * Backend: GET /schedule/teacher/{teacher_id}
 */
export function useTeacherSchedule(teacherId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.byTeacher(teacherId, termId),
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/teacher/${teacherId}`,
        {
          params: { term_id: termId },
        },
      );
      return data;
    },
    enabled: !!teacherId && !!termId,
  });
}

// NOTE: The backend schedule module is read-only — it derives data from
// TeacherSubject assignments. There are no POST/PATCH/DELETE endpoints.
// To manage schedule, use the academics module to manage teacher-subject
// assignments (TeacherSubject CRUD via the teachers router).

export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateScheduleEntryPayload): Promise<ScheduleEntry> => {
      const { data } = await axiosInstance.post("/schedule", payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.bySection(variables.section_id, variables.term_id),
      });
    },
  });
}

export function useUpdateScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateScheduleEntryPayload;
    }): Promise<ScheduleEntry> => {
      const { data } = await axiosInstance.patch(`/schedule/${id}`, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.bySection(variables.payload.section_id, variables.payload.term_id),
      });
    },
  });
}

export function useDeleteScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      id: string;
      sectionId: string;
      termId: string;
    }) => {
      const { data } = await axiosInstance.delete(`/schedule/${id}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.bySection(variables.sectionId, variables.termId),
      });
    },
  });
}
