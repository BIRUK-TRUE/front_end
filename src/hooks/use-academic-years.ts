import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';

export interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ['academics', 'years'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/academics/years', { params: { size: 100 } });
      // Backend returns paginated response: { items: [...], total, page, size }
      return (data?.items ?? data) as AcademicYear[];
    },
  });
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
