"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherDashboardStats } from "../types";

type TeacherScheduleApiEntry = {
  id: string;
  section_id: string;
  day_of_week: number;
};

export function useTeacherDashboard(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.dashboard(teacherId),
    queryFn: async (): Promise<TeacherDashboardStats> => {
      const { data } = await axiosInstance.get<TeacherDashboardStats>(
        `/teachers/${teacherId}/dashboard-stats`
      );
      return data;
    },
    enabled: !!teacherId,
  });
}
