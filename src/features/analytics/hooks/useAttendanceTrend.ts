'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { AttendanceTrendEntry, analyticsKeys } from "../types";

export function useAttendanceTrend(filters?: {
  days: number;
  classId?: string;
  sectionId?: string;
  teacherId?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.trend(filters),
    queryFn: async (): Promise<AttendanceTrendEntry[]> => {
      const { data: response } = await axiosInstance.get<{
        data: Array<{
          date: string;
          present_count: number;
          absent_count: number;
          attendance_percentage: number;
        }>;
        average_attendance: number;
        trend: string;
      }>('/analytics/attendance-trend', {
        params: filters,
      });
      return response.data.map(item => ({
        date: item.date,
        present: item.present_count,
        absent: item.absent_count,
        late: 0,
        excused: 0,
        rate: item.attendance_percentage,
      }));
    },
    enabled: true,
  });
}
