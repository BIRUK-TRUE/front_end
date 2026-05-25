"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { toast } from "sonner";
import type { ScheduleEntry } from "../types";

export const scheduleKeys = {
  all: ["schedule"] as const,
  bySection: (sectionId: string, termId: string) =>
    [...scheduleKeys.all, "section", sectionId, termId] as const,
  byTeacher: (teacherId: string, termId: string) =>
    [...scheduleKeys.all, "teacher", teacherId, termId] as const,
  byClassroom: (classroomId: string, termId: string) =>
    [...scheduleKeys.all, "classroom", classroomId, termId] as const,
  byTerm: (termId: string) =>
    [...scheduleKeys.all, "term", termId] as const,
  period: (periodId: string) =>
    [...scheduleKeys.all, "period", periodId] as const,
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

/**
 * Create schedule entry (stub - not implemented in backend).
 * TODO: Schedule management should be done via teacher-subject assignments.
 */
export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      // TODO: Backend does not have POST /schedule endpoint
      // Schedule is derived from TeacherSubject assignments
      toast.error("Schedule creation not yet implemented. Use teacher-subject assignments instead.");
      throw new Error("Not implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

/**
 * Update schedule entry (stub - not implemented in backend).
 * TODO: Schedule management should be done via teacher-subject assignments.
 */
export function useUpdateScheduleEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // TODO: Backend does not have PATCH /schedule/{id} endpoint
      // Schedule is derived from TeacherSubject assignments
      toast.error("Schedule update not yet implemented. Use teacher-subject assignments instead.");
      throw new Error("Not implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

/**
 * Delete schedule entry (stub - not implemented in backend).
 * TODO: Schedule management should be done via teacher-subject assignments.
 */
export function useDeleteScheduleEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entryId: string) => {
      // TODO: Backend does not have DELETE /schedule/{id} endpoint
      // Schedule is derived from TeacherSubject assignments
      toast.error("Schedule deletion not yet implemented. Use teacher-subject assignments instead.");
      throw new Error("Not implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}
