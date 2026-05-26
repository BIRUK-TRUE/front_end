'use client';

import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { axiosInstance } from "@/lib/api/axios";
import { ClassPerformanceEntry, analyticsKeys } from "../types";

export function useClassPerformance(termId?: string) {
  return useAuthenticatedQuery({
    queryKey: analyticsKeys.performance(termId),
    queryFn: async (): Promise<ClassPerformanceEntry[]> => {
      const { data } = await axiosInstance.get('/analytics/class-performance', {
        params: { termId },
      });
      const classes = data?.classes ?? data ?? [];
      return (Array.isArray(classes) ? classes : []).map(
        (c: Record<string, unknown>) => ({
          classId: String(c.class_id ?? c.classId ?? ''),
          className: String(c.class_name ?? c.className ?? ''),
          sectionName: String(c.section_name ?? c.sectionName ?? ''),
          avgAttendance: Number(c.avg_attendance ?? c.avgAttendance ?? 0),
          avgGrade: Number(c.avg_grade ?? c.avgGrade ?? 0),
          atRiskCount: Number(c.at_risk_count ?? c.atRiskCount ?? 0),
          onTrackCount: Number(c.on_track_count ?? c.onTrackCount ?? 0),
          totalStudents: Number(c.total_students ?? c.totalStudents ?? 0),
        }),
      );
    },
    enabled: !!termId,
  });
}
