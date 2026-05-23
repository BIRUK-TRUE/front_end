"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import type { 
  CreateScheduleEntryPayload, 
  ScheduleEntry,
  SchedulePeriod,
  CreateSchedulePeriodPayload,
  UpdateSchedulePeriodPayload,
  TimetableGenerationResult,
  ConflictCheckResult,
} from "../types";

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

// ==========================================
// SCHEDULE PERIOD HOOKS (NEW)
// ==========================================

/**
 * Get timetable for a section with time slots.
 * Backend: GET /schedule/section/{section_id}/timetable
 */
export function useSectionTimetable(sectionId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.bySection(sectionId, termId),
    queryFn: async (): Promise<SchedulePeriod[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/section/${sectionId}/timetable`,
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
 * Get timetable for a teacher with time slots.
 * Backend: GET /schedule/teacher/{teacher_id}/timetable
 */
export function useTeacherTimetable(teacherId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.byTeacher(teacherId, termId),
    queryFn: async (): Promise<SchedulePeriod[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/teacher/${teacherId}/timetable`,
        {
          params: { term_id: termId },
        },
      );
      return data;
    },
    enabled: !!teacherId && !!termId,
  });
}

/**
 * Get timetable for a classroom.
 * Backend: GET /schedule/classroom/{classroom_id}/timetable
 */
export function useClassroomTimetable(classroomId: string, termId: string) {
  return useQuery({
    queryKey: scheduleKeys.byClassroom(classroomId, termId),
    queryFn: async (): Promise<SchedulePeriod[]> => {
      const { data } = await axiosInstance.get(
        `/schedule/classroom/${classroomId}/timetable`,
        {
          params: { term_id: termId },
        },
      );
      return data;
    },
    enabled: !!classroomId && !!termId,
  });
}

/**
 * Get all periods for a term.
 * Backend: GET /schedule/term/{term_id}
 */
export function useTermTimetable(termId: string) {
  return useQuery({
    queryKey: scheduleKeys.byTerm(termId),
    queryFn: async (): Promise<SchedulePeriod[]> => {
      const { data } = await axiosInstance.get(`/schedule/term/${termId}`);
      return data;
    },
    enabled: !!termId,
  });
}

/**
 * Get a single schedule period.
 * Backend: GET /schedule/periods/{period_id}
 */
export function useSchedulePeriod(periodId: string) {
  return useQuery({
    queryKey: scheduleKeys.period(periodId),
    queryFn: async (): Promise<SchedulePeriod> => {
      const { data } = await axiosInstance.get(`/schedule/periods/${periodId}`);
      return data;
    },
    enabled: !!periodId,
  });
}

/**
 * Create a new schedule period.
 * Backend: POST /schedule/periods
 */
export function useCreateSchedulePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSchedulePeriodPayload): Promise<SchedulePeriod> => {
      const { data } = await axiosInstance.post("/schedule/periods", payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.byTerm(variables.term_id),
      });
    },
  });
}

/**
 * Update a schedule period.
 * Backend: PATCH /schedule/periods/{id}
 */
export function useUpdateSchedulePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSchedulePeriodPayload;
    }): Promise<SchedulePeriod> => {
      const { data } = await axiosInstance.patch(`/schedule/periods/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate all schedule queries
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.all,
      });
    },
  });
}

/**
 * Delete a schedule period.
 * Backend: DELETE /schedule/periods/{id}
 */
export function useDeleteSchedulePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/schedule/periods/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.all,
      });
    },
  });
}

/**
 * Generate timetable automatically.
 * Backend: POST /schedule/generate
 */
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
    onSuccess: (_data, variables) => {
      // Invalidate all schedule queries for the term
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.byTerm(variables.term_id),
      });
    },
  });
}

/**
 * Validate schedule period for conflicts.
 * Backend: POST /schedule/validate
 */
export function useValidateSchedulePeriod() {
  return useMutation({
    mutationFn: async (payload: {
      teacher_subject_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      classroom_id?: string;
    }): Promise<ConflictCheckResult> => {
      const { data } = await axiosInstance.post("/schedule/validate", payload);
      return data;
    },
  });
}
