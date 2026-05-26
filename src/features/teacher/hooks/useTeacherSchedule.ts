"use client";

import { useAuthenticatedQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherScheduleEntry } from "../types";

type TeacherSubjectApiResponse = {
  id: string;
  teacher_id: string;
  section_id: string;
  section_name: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
};

export function useTeacherSchedule(teacherId: string, weekOffset: number = 0) {
  return useAuthenticatedQuery({
    queryKey: queryKeys.teacher.schedule(teacherId, weekOffset),
    queryFn: async (): Promise<TeacherScheduleEntry[]> => {
      const { data } = await axiosInstance.get<TeacherSubjectApiResponse[]>(
        `/teachers/${teacherId}/schedule`,
        { params: { week_offset: weekOffset } },
      );
      const items = Array.isArray(data) ? data : [];
      // Backend returns subject assignments — no day/period yet
      // Map to schedule entries with placeholder time data
      return items.map((item, index) => ({
        id: item.id,
        dayOfWeek: 1,
        periodNumber: index + 1,
        startTime: '08:00',
        endTime: '09:00',
        subjectName: item.subject_name,
        className: item.class_name,
        sectionName: item.section_name,
        sectionId: item.section_id,
        subjectId: item.subject_id,
        room: null,
      }));
    },
    enabled: !!teacherId,
  });
}
