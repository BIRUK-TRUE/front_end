"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherDashboardStats } from "../types";

export function useTeacherDashboard(teacherId: string) {
  return useQuery({
    queryKey: queryKeys.teacher.dashboard(teacherId),
    queryFn: async (): Promise<TeacherDashboardStats> => {
      // BACKEND REQUIRED: GET /teachers/{teacherId}/dashboard-stats
      // Expected response: { todayClasses, totalStudents, pendingGrades, attendanceTakenToday, recentActivity, currentTermName }
      const { data } = await axiosInstance.get(
        `/teachers/${teacherId}/dashboard-stats`,
      );
      return data;
    },
    enabled: !!teacherId,
  });
}
