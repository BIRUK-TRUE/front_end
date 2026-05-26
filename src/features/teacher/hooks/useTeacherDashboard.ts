"use client";

import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { axiosInstance } from "@/lib/api/axios";
import { queryKeys } from "@/lib/api/query-keys";
import type { TeacherDashboardStats } from "../types";

type TeacherScheduleApiEntry = {
  id: string;
  section_id: string;
  day_of_week: number;
};

type DashboardApiResponse = {
  teacher_id: string;
  today_classes: number;
  total_students: number;
  pending_grades: number;
  attendance_taken_today: boolean;
  total_sections: number;
  total_assignments: number;
};

export function useTeacherDashboard(teacherId: string) {
  return useAuthenticatedQuery({
    queryKey: queryKeys.teacher.dashboard(teacherId),
    queryFn: async (): Promise<TeacherDashboardStats> => {
      const { data } = await axiosInstance.get<DashboardApiResponse>(
        `/teachers/${teacherId}/dashboard-stats`
      );
      return {
        todayClasses: data.today_classes ?? 0,
        totalStudents: data.total_students ?? 0,
        pendingGrades: data.pending_grades ?? 0,
        attendanceTakenToday: {
          taken: data.attendance_taken_today ? 1 : 0,
          total: data.total_sections ?? 0,
        },
        currentTermName: '',
        recentActivity: [],
      };
    },
    enabled: !!teacherId,
  });
}
