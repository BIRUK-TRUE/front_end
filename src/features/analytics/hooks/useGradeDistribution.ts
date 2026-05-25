'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { GradeDistributionEntry, analyticsKeys } from "../types";

/**
 * TODO: Analytics module not yet implemented in backend.
 * This hook returns stub data until /analytics/grade-distribution endpoint is created.
 */

export function useGradeDistribution(filters?: {
  termId: string;
  subjectId?: string;
  classId?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.distribution(filters),
    queryFn: async (): Promise<GradeDistributionEntry[]> => {
      // TODO: Backend endpoint /analytics/grade-distribution not yet implemented
      return [];
    },
    enabled: true,
  });
}
