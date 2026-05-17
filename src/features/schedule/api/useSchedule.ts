"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils/formatApiError";
import type { ScheduleEntry, CreateScheduleEntryPayload } from "../types";

export const scheduleKeys = {
  all: ["schedule"] as const,
  bySection: (sectionId: string, termId: string) =>
    [...scheduleKeys.all, "section", sectionId, termId] as const,
  byTeacher: (teacherId: string, termId: string) =>
    [...scheduleKeys.all, "teacher", teacherId, termId] as const,
};

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

export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateScheduleEntryPayload) => {
      const { data } = await axiosInstance.post("/schedule", payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.bySection(
          variables.section_id,
          variables.term_id,
        ),
      });
      toast.success("Schedule entry created");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to create schedule entry"));
    },
  });
}

export function useDeleteScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      sectionId,
      termId,
    }: {
      id: string;
      sectionId: string;
      termId: string;
    }) => {
      await axiosInstance.delete(`/schedule/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.bySection(variables.sectionId, variables.termId),
      });
      toast.success("Schedule entry deleted");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to delete entry"));
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
      payload: Partial<CreateScheduleEntryPayload>;
    }) => {
      const { data } = await axiosInstance.patch(`/schedule/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.payload.section_id && variables.payload.term_id) {
        queryClient.invalidateQueries({
          queryKey: scheduleKeys.bySection(
            variables.payload.section_id,
            variables.payload.term_id,
          ),
        });
      }
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success("Schedule entry updated");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      toast.error(formatApiError(error, "Failed to update entry"));
    },
  });
}
