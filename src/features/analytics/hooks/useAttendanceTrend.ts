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
      const { data } = await axiosInstance.get('/analytics/attendance-trend', {
        params: {
          days: filters?.days ?? 30,
          classId: filters?.classId,
          sectionId: filters?.sectionId,
        },
      });
      const rows = data?.data ?? [];
      return rows.map((row: Record<string, unknown>) => ({
        date: String(row.date ?? ''),
        present: Number(row.present_count ?? 0),
        absent: Number(row.absent_count ?? 0),
        late: 0,
        excused: 0,
        rate: Number(row.attendance_percentage ?? 0),
      }));
    },
  });
}
