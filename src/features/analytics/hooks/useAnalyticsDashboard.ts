'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { AnalyticsSummary } from "../types";

const analyticsAll = ['analytics'] as const;

export const analyticsKeys = {
  all: analyticsAll,
  summary: (filters?: any) => [...analyticsAll, 'summary', filters] as const,
  atRisk: (filters?: any) => [...analyticsAll, 'at-risk', filters] as const,
  trend: (filters?: any) => [...analyticsAll, 'trend', filters] as const,
  distribution: (filters?: any) => [...analyticsAll, 'distribution', filters] as const,
  performance: (filters?: any) => [...analyticsAll, 'performance', filters] as const,
  enrollmentTrends: [...analyticsAll, 'enrollment-trends'] as const,
  recentActivity: [...analyticsAll, 'recent-activity'] as const,
};

export function useAnalyticsSummary(filters?: { termId?: string; classId?: string; teacherId?: string }) {
  return useQuery({
    queryKey: analyticsKeys.summary(filters),
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data } = await axiosInstance.get<AnalyticsSummary>('/analytics/summary', {
        params: filters,
      });
      return data;
    },
    enabled: true,
  });
}

export function useEnrollmentTrends() {
  return useQuery({
    queryKey: analyticsKeys.enrollmentTrends,
    queryFn: async (): Promise<{ year: string; students: number }[]> => {
      const { data } = await axiosInstance.get('/analytics/enrollment-trends');
      return data;
    },
    enabled: true,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: analyticsKeys.recentActivity,
    queryFn: async (): Promise<any[]> => {
      const { data } = await axiosInstance.get('/analytics/recent-activity');
      return data;
    },
    enabled: true,
  });
}
