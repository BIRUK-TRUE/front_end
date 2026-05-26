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
      const { data } = await axiosInstance.get('/analytics/grade-distribution', {
        params: {
          termId: filters?.termId,
          classId: filters?.classId,
          subjectId: filters?.subjectId,
        },
      });
      const distribution = data?.distribution ?? data ?? [];
      return Array.isArray(distribution) ? distribution : [];
    },
    enabled: !!filters?.termId,
  });
}
