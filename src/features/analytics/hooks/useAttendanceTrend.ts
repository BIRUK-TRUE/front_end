'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { AttendanceTrendEntry, analyticsKeys } from "../types";

export function useAttendanceTrend(filters?: {
  days: number;
  classId?: string;
  sectionId?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.trend(filters),
    queryFn: async (): Promise<AttendanceTrendEntry[]> => {
      const { data } = await axiosInstance.get<AttendanceTrendEntry[]>('/analytics/attendance-trend', {
        params: filters,
      });
      return data;
    },
    enabled: true,
  });
}
