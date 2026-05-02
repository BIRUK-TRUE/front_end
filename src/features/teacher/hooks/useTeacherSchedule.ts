"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherScheduleEntry } from "../types";

export function useTeacherSchedule(teacherId: string, weekOffset: number = 0) {
  return useQuery({
    queryKey: queryKeys.teacher.schedule(teacherId, weekOffset),
    queryFn: async (): Promise<TeacherScheduleEntry[]> => {
      const { data } = await axiosInstance.get(`/teachers/${teacherId}/schedule`, {
        params: { week_offset: weekOffset },
      });
      return data;
    },
    enabled: !!teacherId,
  });
}
