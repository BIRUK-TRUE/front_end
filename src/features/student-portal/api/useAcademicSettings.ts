import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import type { AcademicSettings } from '../types';

export function useAcademicSettings() {
  return useQuery({
    queryKey: ['academicSettings'],
    queryFn: async (): Promise<AcademicSettings> => {
      // Derive passing threshold from current academic year settings
      // Backend: GET /academics/years/current
      try {
        await api.get('/academics/years/current');
      } catch {
        // no-op if not set up
      }
      // Return a sensible default — no backend settings endpoint yet
      return { passingThreshold: 50 };
    },
    staleTime: Infinity,
    retry: 1,
  });
}

export function useStudentTerms() {
  return useQuery({
    queryKey: ['student', 'terms'],
    queryFn: async () => {
      // GET /students/me/terms returns terms for the current academic year
      const { data } = await api.get('/students/me/terms');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
