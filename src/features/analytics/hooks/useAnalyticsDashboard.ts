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

/**
 * TODO: Analytics module not yet implemented in backend.
 * These hooks return stub data until /analytics/* endpoints are created.
 */

export function useAnalyticsSummary(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.summary(filters),
    queryFn: async (): Promise<AnalyticsSummary> => {
      // TODO: Backend endpoint /analytics/summary not yet implemented
      // Returning stub data
      return {
        totalStudents: 0,
        schoolAttendanceRate: 0,
        schoolGradeAverage: 0,
        atRiskCounts: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      };
    },
    enabled: true,
  });
}

export function useEnrollmentTrends() {
  return useQuery({
    queryKey: analyticsKeys.enrollmentTrends,
    queryFn: async (): Promise<{ year: string; students: number }[]> => {
      // TODO: Backend endpoint /analytics/enrollment-trends not yet implemented
      return [];
    },
    enabled: true,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: analyticsKeys.recentActivity,
    queryFn: async (): Promise<RecentActivity[]> => {
      // TODO: Backend endpoint /analytics/recent-activity not yet implemented
      return [];
    },
    enabled: true,
  });
}
