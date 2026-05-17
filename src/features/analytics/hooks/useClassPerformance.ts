'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { ClassPerformanceEntry, analyticsKeys } from "../types";

export function useClassPerformance(termId?: string) {
  return useQuery({
    queryKey: analyticsKeys.performance(termId),
    queryFn: async (): Promise<ClassPerformanceEntry[]> => {
      const [performanceRes, atRiskRes] = await Promise.all([
        axiosInstance.get<{
          data: Array<{
            class_id: string;
            class_name: string;
            section_name: string;
            average_grade: number;
            attendance_rate: number;
            total_students: number;
          }>;
          school_average: number;
        }>('/analytics/class-performance', { params: { termId } }),
        axiosInstance.get<{
          data: Array<{
            class_name: string;
            section_name: string;
          }>;
        }>('/analytics/at-risk-students').catch(() => ({ data: { data: [] } })),
      ]);

      const atRiskList = atRiskRes.data?.data || [];
      return performanceRes.data.data.map(item => {
        const atRiskCount = atRiskList.filter(
          s => s.class_name === item.class_name && s.section_name === item.section_name
        ).length;

        return {
          classId: item.class_id,
          className: item.class_name,
          sectionName: item.section_name,
          avgGrade: item.average_grade,
          avgAttendance: item.attendance_rate,
          totalStudents: item.total_students,
          atRiskCount,
          onTrackCount: Math.max(0, item.total_students - atRiskCount),
        };
      });
    },
    enabled: true,
  });
}
