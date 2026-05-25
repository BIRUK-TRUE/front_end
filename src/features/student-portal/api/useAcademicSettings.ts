import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import type { AcademicSettings } from '../types';

/**
 * Get academic settings (passing threshold, etc).
 *
 * No dedicated backend endpoint — returns sensible defaults.
 */
export function useAcademicSettings() {
  return useQuery({
    queryKey: ['academicSettings'],
    queryFn: async (): Promise<AcademicSettings> => {
      // Return sensible defaults — no backend settings endpoint yet
      return { passingThreshold: 50 };
    },
    staleTime: Infinity,
    retry: 1,
  });
}

/**
 * Get terms available for the current academic year.
 * Backend: GET /academics/years (find current year, then get its terms)
 */
export function useStudentTerms() {
  return useQuery({
    queryKey: ['student', 'terms'],
    queryFn: async () => {
      try {
        // Get academic years to find the current one
        const { data: yearsData } = await api.get('/academics/years', {
          params: { page: 1, size: 10 },
        });
        const years = yearsData?.items ?? (Array.isArray(yearsData) ? yearsData : []);
        const currentYear = years.find((y: Record<string, unknown>) => y.is_current);

        if (!currentYear?.id) return [];

        // Get terms for the current year
        const { data: termsData } = await api.get(
          `/academics/years/${currentYear.id}/terms`
        );
        return termsData?.items ?? (Array.isArray(termsData) ? termsData : []);
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
