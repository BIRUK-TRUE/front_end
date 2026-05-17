import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';

export interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

export function useCurrentYear() {
  return useQuery({
    queryKey: ['academics', 'years', 'current'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<AcademicYear>('/academics/years/current');
      return data;
    },
  });
}

export function useCurrentTerm() {
  return useQuery({
    queryKey: ['academics', 'terms', 'current'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ id: string; name: string; is_current: boolean }>('/academics/terms/current');
      return data;
    },
  });
}
