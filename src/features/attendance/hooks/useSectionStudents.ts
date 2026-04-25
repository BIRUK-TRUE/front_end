import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';

export interface SectionStudent {
  id: string;
  name: string;
  registration_number: string;
  email?: string;
  phone?: string;
}

export function useSectionStudents(sectionId?: string) {
  return useQuery({
    queryKey: queryKeys.sectionStudents.list(sectionId || ''),
    queryFn: async (): Promise<SectionStudent[]> => {
      if (!sectionId) return [];
      // BACKEND REQUIRED: GET /sections/{sectionId}/students
      // Expected response: { items: SectionStudent[] }
      const { data } = await axiosInstance.get(`/sections/${sectionId}/students`);
      return data.items || [];
    },
    enabled: !!sectionId,
  });
}
