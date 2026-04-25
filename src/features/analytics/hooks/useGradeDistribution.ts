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
      const { data } = await axiosInstance.get<GradeDistributionEntry[]>('/analytics/grade-distribution', {
        params: filters,
      });
      return data;
    },
    enabled: !!filters?.termId,
  });
}
