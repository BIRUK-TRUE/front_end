"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import type { ScheduleEntry } from "../types";

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
