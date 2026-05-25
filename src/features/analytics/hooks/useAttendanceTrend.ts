'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { AttendanceTrendEntry, analyticsKeys } from "../types";

/**
 * TODO: Analytics module not yet implemented in backend.
 * This hook returns stub data until /analytics/attendance-trend endpoint is created.
 */

export function useAttendanceTrend(filters?: {
  days: number;
  classId?: string;
  sectionId?: string;
  teacherId?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.trend(filters),
    queryFn: async (): Promise<AttendanceTrendEntry[]> => {
      // TODO: Backend endpoint /analytics/attendance-trend not yet implemented
      return [];
    },
    enabled: true,
  });
}
