'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { ClassPerformanceEntry, analyticsKeys } from "../types";

/**
 * TODO: Analytics module not yet implemented in backend.
 * This hook returns stub data until /analytics/class-performance endpoint is created.
 */

export function useClassPerformance(termId?: string) {
  return useQuery({
    queryKey: analyticsKeys.performance(termId),
    queryFn: async (): Promise<ClassPerformanceEntry[]> => {
      // TODO: Backend endpoint /analytics/class-performance not yet implemented
      return [];
    },
    enabled: true,
  });
}
