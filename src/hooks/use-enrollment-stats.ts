'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api/axios';

interface HistoricalStat {
  year: string;
  students: number;
}

export function useHistoricalEnrollment() {
  return useQuery({
    queryKey: ['enrollments', 'historical-stats'],
    queryFn: async (): Promise<HistoricalStat[]> => {
      const { data } = await axiosInstance.get('/enrollments/historical-stats');
      return data;
    },
  });
}
