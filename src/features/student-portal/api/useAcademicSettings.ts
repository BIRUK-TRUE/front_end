import { useQuery } from '@tanstack/react-query';
import { axiosInstance as api } from '@/lib/api/axios';
import { settingsKeys } from '@/hooks/useSettings';
import type { AcademicSettings } from '../types';

export function useAcademicSettings() {
  return useQuery({
    queryKey: settingsKeys.academic(),
    queryFn: async () => {
      const { data } = await api.get<AcademicSettings>('/settings/academic');
      return data;
    },
    // Academic settings rarely change, use infinite stale time
    staleTime: Infinity,
    retry: 1, // Fail fast if backend is not ready
    enabled: true,
  });
}

export function useStudentTerms() {
  return useQuery({
    queryKey: ['student', 'terms'],
    queryFn: async () => {
      const { data } = await api.get('/students/me/terms');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
