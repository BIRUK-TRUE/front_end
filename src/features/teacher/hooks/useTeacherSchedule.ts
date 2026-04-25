"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherScheduleEntry } from "../types";

export function useTeacherSchedule(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.schedule(teacherId),
    queryFn: async (): Promise<TeacherScheduleEntry[]> => {
      // BACKEND REQUIRED: GET /teachers/{teacherId}/schedule
      // Expected response: TeacherScheduleEntry[]
      const { data } = await axiosInstance.get(`/teachers/${teacherId}/schedule`);
      return data;
    },
    enabled: !!teacherId,
  });
}
