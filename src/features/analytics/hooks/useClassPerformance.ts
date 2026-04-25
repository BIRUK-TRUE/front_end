'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { ClassPerformanceEntry, analyticsKeys } from "../types";

export function useClassPerformance(termId?: string) {
  return useQuery({
    queryKey: analyticsKeys.performance(termId),
    queryFn: async (): Promise<ClassPerformanceEntry[]> => {
      const { data } = await axiosInstance.get<ClassPerformanceEntry[]>('/analytics/class-performance', {
        params: { termId },
      });
      return data;
    },
    enabled: !!termId,
  });
}
