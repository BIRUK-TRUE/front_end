'use client';

import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { axiosInstance } from "@/lib/api/axios";
import { GradeDistributionEntry, analyticsKeys } from "../types";

export function useGradeDistribution(filters?: {
  termId: string;
  subjectId?: string;
  classId?: string;
}) {
  return useAuthenticatedQuery({
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
