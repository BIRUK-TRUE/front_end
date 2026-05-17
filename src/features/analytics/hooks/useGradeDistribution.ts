'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { GradeDistributionEntry, analyticsKeys } from "../types";

export function useGradeDistribution(filters?: {
  termId: string;
  subjectId?: string;
  classId?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.distribution(filters),
    queryFn: async (): Promise<GradeDistributionEntry[]> => {
      const { data: response } = await axiosInstance.get<{
        data: Array<{
          grade: string;
          count: number;
          percentage: number;
        }>;
        total_assessments: number;
      }>('/analytics/grade-distribution', {
        params: filters,
      });
      return response.data.map(item => ({
        grade_letter: item.grade,
        count: item.count,
        percentage: item.percentage,
      }));
    },
    enabled: true,
  });
}
