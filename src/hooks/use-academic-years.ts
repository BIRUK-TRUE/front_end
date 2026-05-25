import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';

/**
 * Re-export academic year hooks from the centralized location
 */
export { 
  useAcademicYears,
  useAcademicYear,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  useSetCurrentAcademicYear
} from '@/features/academics/api/useAcademicYears';

export interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Term {
  id: string;
  name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
}

/**
 * Get the current academic year
 */
export function useCurrentYear() {
  return useQuery({
    queryKey: ['academics', 'years', 'current'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<AcademicYear>('/academics/years/current');
      return data;
    },
    retry: 1,
  });
}

/**
 * Get the current term
 */
export function useCurrentTerm() {
  return useQuery({
    queryKey: ['academics', 'terms', 'current'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Term>('/academics/terms/current');
      return data;
    },
    retry: 1,
  });
}
