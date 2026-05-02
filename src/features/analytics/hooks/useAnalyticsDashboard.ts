'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { AnalyticsSummary } from "../types";

interface AnalyticsFilters {
  termId?: string;
  classId?: string;
  teacherId?: string;
  sectionId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
  };
}

const analyticsAll = ['analytics'] as const;

export const analyticsKeys = {
  all: analyticsAll,
  summary: (filters?: AnalyticsFilters) => [...analyticsAll, 'summary', filters] as const,
  atRisk: (filters?: AnalyticsFilters) => [...analyticsAll, 'at-risk', filters] as const,
  trend: (filters?: AnalyticsFilters) => [...analyticsAll, 'trend', filters] as const,
  distribution: (filters?: AnalyticsFilters) => [...analyticsAll, 'distribution', filters] as const,
  performance: (filters?: AnalyticsFilters) => [...analyticsAll, 'performance', filters] as const,
  enrollmentTrends: [...analyticsAll, 'enrollment-trends'] as const,
  recentActivity: [...analyticsAll, 'recent-activity'] as const,
};

export function useAnalyticsSummary(filters?: AnalyticsFilters) {
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
    queryFn: async (): Promise<RecentActivity[]> => {
      const { data } = await axiosInstance.get('/analytics/recent-activity');
      return data;
    },
    enabled: true,
  });
}
