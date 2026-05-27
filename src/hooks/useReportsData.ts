import { useQueries } from "@tanstack/react-query";
import { reportsService } from "@/lib/api/reports.service";

interface UseReportsDataOptions {
  selectedYear?: string;
  reportType: string;
}

/**
 * Custom hook for optimized reports data fetching
 * - Implements parallel data fetching
 * - Conditional fetching based on active tab
 * - Aggressive caching strategy
 * - Prefetching for better UX
 */
export function useReportsData({ selectedYear, reportType }: UseReportsDataOptions) {
  const queries = useQueries({
    queries: [
      // Always fetch summary stats (needed for all tabs)
      {
        queryKey: ['reports', 'summary', selectedYear],
        queryFn: () => reportsService.getSummary({ 
          ...(selectedYear && { classId: selectedYear })
        }),
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on component mount if data exists
      },
      // Conditionally fetch grade distribution (only for academic tab)
      {
        queryKey: ['reports', 'grade-distribution', selectedYear],
        queryFn: () => reportsService.getGradeDistribution({
          ...(selectedYear && { classId: selectedYear })
        }),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled: reportType === 'academic',
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      // Conditionally fetch attendance trend (only for attendance tab)
      {
        queryKey: ['reports', 'attendance-trend', selectedYear],
        queryFn: () => reportsService.getAttendanceTrend({
          days: 30,
          ...(selectedYear && { classId: selectedYear })
        }),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled: reportType === 'attendance',
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    ],
  });

  const [statsQuery, gradeDistributionQuery, attendanceTrendQuery] = queries;

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    isErrorStats: statsQuery.isError,
    
    gradeDistribution: gradeDistributionQuery.data,
    isLoadingGrades: gradeDistributionQuery.isLoading,
    
    attendanceTrend: attendanceTrendQuery.data,
    isLoadingAttendance: attendanceTrendQuery.isLoading,
    
    // Overall loading state (only true on initial load)
    isInitialLoading: statsQuery.isLoading && !statsQuery.data,
  };
}
