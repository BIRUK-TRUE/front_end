'use client';

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api/axios";
import { AnalyticsSummary, analyticsKeys } from "../types";

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

export function useAnalyticsSummary(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.summary(filters),
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data } = await axiosInstance.get('/analytics/summary', {
        params: {
          termId: filters?.termId,
          classId: filters?.classId,
        },
      });
      return {
        totalStudents: data.total_students ?? 0,
        schoolAttendanceRate: data.attendance_rate ?? 0,
        schoolGradeAverage: data.average_grade ?? 0,
        atRiskCounts: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      };
    },
  });
}

export function useEnrollmentTrends() {
  return useQuery({
    queryKey: analyticsKeys.enrollmentTrends,
    queryFn: async (): Promise<{ year: string; students: number }[]> => {
      const { data } = await axiosInstance.get('/analytics/enrollment-trends');
      const items = Array.isArray(data) ? data : data?.trends ?? [];
      return items.map((item: Record<string, unknown>) => ({
        year: String(item.year ?? item.academic_year ?? ''),
        students: Number(item.students ?? item.count ?? 0),
      }));
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: analyticsKeys.recentActivity,
    queryFn: async (): Promise<RecentActivity[]> => {
      const { data } = await axiosInstance.get('/analytics/recent-activity');
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map((item: Record<string, unknown>) => ({
        id: String(item.id ?? ''),
        type: String(item.type ?? item.activity_type ?? 'info'),
        description: String(item.description ?? item.message ?? ''),
        timestamp: String(item.timestamp ?? item.created_at ?? ''),
        user: item.user
          ? {
              id: String((item.user as Record<string, unknown>).id ?? ''),
              name: String((item.user as Record<string, unknown>).name ?? ''),
            }
          : undefined,
      }));
    },
  });
}
